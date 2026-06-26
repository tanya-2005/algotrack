import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { getQuickRecallQuestion } from "../../lib/memoryEngine";

type Props = {
  enabled?: boolean;
};

export default function QuickRecall({ enabled = true }: Props) {
  const { data } = useMemory();
  const [visible, setVisible] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const [answered, setAnswered] = useState(false);

  const question = getQuickRecallQuestion(data);

  useEffect(() => {
    if (!enabled) return;
    const key = "dsa-quick-recall-shown";
    const sessionShown = sessionStorage.getItem(key);
    if (sessionShown) return;
    const timer = setTimeout(() => {
      if (Math.random() > 0.35) {
        setVisible(true);
        sessionStorage.setItem(key, "1");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!visible || answered) return;
    if (seconds <= 0) {
      setAnswered(true);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, seconds, answered]);

  if (!visible || !question) return null;

  return (
    <div className="quick-recall-overlay" role="dialog" aria-label="Quick Recall">
      <div className="quick-recall-card">
        <div className="quick-recall-header">
          <Zap size={18} />
          <strong>Quick Recall</strong>
          <span className="quick-recall-timer">{seconds}s</span>
        </div>
        <p className="quick-recall-prompt">
          What pattern is used in <strong>{question.name}</strong>?
        </p>
        {!answered ? (
          <div className="quick-recall-options">
            {[question.pattern, "Dynamic Programming", "Graph", "Binary Search"]
              .filter((v, i, a) => a.indexOf(v) === i)
              .slice(0, 4)
              .map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswered(true)}
                  className={
                    opt === question.pattern ? "correct" : ""
                  }
                >
                  {opt}
                </button>
              ))}
          </div>
        ) : (
          <p className="quick-recall-answer">
            Answer: <strong>{question.pattern}</strong>
          </p>
        )}
        <button className="quick-recall-dismiss" onClick={() => setVisible(false)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

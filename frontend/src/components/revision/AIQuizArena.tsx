import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  ChevronRight,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
  X,
} from "lucide-react";
import type { QuizQuestion } from "../../lib/types";
import { getQuizModeCounts, quizTypeLabels } from "../../lib/quizEngine";

const quizModes = [
  { name: "Pattern Recognition", key: "pattern-recognition", icon: Target },
  { name: "Reflection Recall", key: "reflection-recall", icon: MessageSquareText },
  { name: "Mistake Recovery", key: "mistake-recovery", icon: RefreshCw },
  { name: "Concept Recall", key: "concept-recall", icon: Zap },
  { name: "Random Memory Check", key: "random-memory", icon: Target },
  { name: "Mixed Battle", key: "mixed-battle", icon: Zap },
];

type Props = {
  quizReady: boolean;
  quiz: QuizQuestion[];
  onGenerate: () => void;
  onStartQuiz: () => void;
};

export default function AIQuizArena({
  quizReady,
  quiz,
  onGenerate,
  onStartQuiz,
}: Props) {
  const counts = quizReady ? getQuizModeCounts(quiz) : {};

  return (
    <section className="quiz-arena-card">
      <div className="arena-glow" />
      <div className="arena-copy">
        <div className="arena-label">
          <Sparkles size={14} /> AI generated · Personalized to you
        </div>
        <h2>
          AI Quiz <span>Arena</span>
        </h2>
        <p>
          A focused revision battle generated from your real problem-solving
          history—not a generic question bank.
        </p>
        <div className="arena-sources">
          {["Solved questions", "Reflections", "Mistakes", "AI chat"].map(
            (source) => (
              <span key={source}>
                <Check size={13} /> {source}
              </span>
            )
          )}
        </div>
        <div className="arena-actions">
          <button className="rev-primary-btn" onClick={onGenerate}>
            <Sparkles size={17} />{" "}
            {quizReady ? "Regenerate quiz" : "Generate today's quiz"}{" "}
            <ArrowRight size={17} />
          </button>
          {quizReady && (
            <button className="rev-secondary-btn" onClick={onStartQuiz}>
              Start Quiz ({quiz.length} Q)
            </button>
          )}
        </div>
      </div>
      <div className="arena-console">
        <div className="console-top">
          <div>
            <span className="console-status" /> QUIZ LOADOUT
          </div>
          <span className="mono">{quizReady ? `${quiz.length} Q` : "15 Q"}</span>
        </div>
        <div className="quiz-mode-list">
          {quizModes.map(({ name, key, icon: Icon }, index) => {
            const count = counts[key as keyof typeof counts] ?? 0;
            const detail = quizReady
              ? `${count} question${count !== 1 ? "s" : ""}`
              : "Ready on generate";
            return (
              <div
                className={`quiz-mode ${quizReady ? "ready" : ""}`}
                key={name}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="mode-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
                <ChevronRight size={17} />
              </div>
            );
          })}
        </div>
        <div className="console-foot">
          <span>Estimated time</span>
          <strong>
            <Clock3 size={14} /> {quizReady ? Math.ceil(quiz.length * 1.2) : 18}{" "}
            min
          </strong>
        </div>
      </div>
    </section>
  );
}

type QuizModalProps = {
  quiz: QuizQuestion[];
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
};

export function QuizSessionModal({
  quiz,
  onClose,
  onComplete,
}: QuizModalProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = quiz[index];

  const submit = () => {
    if (!selected || !current) return;
    const correct = selected === current.correctId;
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    if (index >= quiz.length - 1) {
      setDone(true);
      onComplete(newScore, quiz.length);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (!current) return null;

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <div className="quiz-modal-header">
          <span>
            {quizTypeLabels[current.type]} · {index + 1}/{quiz.length}
          </span>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {done ? (
          <div className="quiz-modal-result">
            <h3>Quiz Complete!</h3>
            <p className="mono">
              {score}/{quiz.length}
            </p>
            <button type="button" className="rev-primary-btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            {current.context && (
              <p className="quiz-context">{current.context}</p>
            )}
            <h3>{current.prompt}</h3>
            <div className="quiz-options">
              {current.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={selected === opt.id ? "selected" : ""}
                  onClick={() => setSelected(opt.id)}
                >
                  <span>{opt.id}</span> {opt.text}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rev-primary-btn"
              disabled={!selected}
              onClick={submit}
            >
              {index >= quiz.length - 1 ? "Finish" : "Next"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

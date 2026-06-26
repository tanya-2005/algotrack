import { useMemo, useState } from "react";
import { Check, ChevronRight, Clock3 } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { generatePatternChallenge } from "../../lib/quizEngine";

export default function PatternChallenge() {
  const { data, advanceDailyChallenge } = useMemory();
  const challenge = useMemo(
    () => generatePatternChallenge(data),
    [data]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const progress = Math.min(data.dailyChallengeIndex + 1, 5);

  const handleSelect = (id: string, text: string) => {
    setSelected(text);
    setRevealed(true);
  };

  const handleSkip = () => {
    advanceDailyChallenge();
    setSelected(null);
    setRevealed(false);
  };

  return (
    <section className="rev-panel challenge-card revision-major-card pattern-challenge-large">
      <div className="challenge-top">
        <span className="mini-label">Pattern recognition challenge</span>
        <span className="mono daily-challenge-progress">
          Daily Challenge {progress} / 5
        </span>
      </div>
      <h2>Which pattern would you use?</h2>
      <p className="challenge-question">{challenge.question}</p>
      <div className="answer-grid">
        {challenge.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelect(opt.id, opt.text)}
            className={`${
              selected === opt.text ? "selected" : ""
            } ${
              revealed && opt.id === challenge.correctId ? "correct-answer" : ""
            }`}
          >
            <span>{opt.id}</span>
            {opt.text}
            {selected === opt.text && <Check size={15} />}
          </button>
        ))}
      </div>
      <div className="challenge-footer">
        <span>
          <Clock3 size={14} /> Take your time—recognition beats speed.
        </span>
        <button type="button" onClick={handleSkip}>
          Skip <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}

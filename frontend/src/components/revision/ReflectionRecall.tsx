import { useMemo, useState } from "react";
import { Check, MessageSquareText } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { generateReflectionQuiz } from "../../lib/quizEngine";
import { formatRelative } from "../../lib/memoryEngine";

export default function ReflectionRecall() {
  const { data } = useMemory();
  const quiz = useMemo(() => generateReflectionQuiz(data), [data]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!quiz) {
    return (
      <section className="rev-panel recall-card revision-major-card">
        <p className="recall-empty">Add reflections to unlock Memory Flashback.</p>
      </section>
    );
  }

  const source = data.questions.find((q) => q.id === quiz.sourceQuestionId);
  const correct = quiz.options.find((o) => o.id === quiz.correctId);

  return (
    <section className="rev-panel recall-card revision-major-card">
      <div className="panel-heading compact">
        <div>
          <span className="section-icon green">
            <MessageSquareText size={18} />
          </span>
          <div>
            <span className="mini-label">Memory Flashback</span>
            <h2>Do you still remember?</h2>
          </div>
        </div>
        {source && (
          <span className="memory-chip">
            {formatRelative(source.lastRevisedAt ?? source.solvedAt)}
          </span>
        )}
      </div>

      {source && (
        <div className="reflection-problem">
          <small>QUESTION</small>
          <strong>{source.name}</strong>
        </div>
      )}

      {quiz.context && <blockquote>{quiz.context}</blockquote>}
      <p className="recall-prompt">{quiz.prompt}</p>

      <div className="flashback-options">
        {quiz.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`flashback-option ${
              selected === opt.id ? "selected" : ""
            } ${
              revealed && opt.id === quiz.correctId ? "correct" : ""
            } ${
              revealed &&
              selected === opt.id &&
              opt.id !== quiz.correctId
                ? "wrong"
                : ""
            }`}
            onClick={() => {
              setSelected(opt.id);
              setRevealed(true);
            }}
          >
            <span>{opt.id}</span> {opt.text}
            {revealed && opt.id === quiz.correctId && (
              <Check size={15} />
            )}
          </button>
        ))}
      </div>

      {revealed && correct && (
        <p className="flashback-feedback">
          {selected === quiz.correctId
            ? "Correct — strong recall!"
            : `Correct answer: ${correct.text}`}
        </p>
      )}
    </section>
  );
}

import { Trophy, FileText, MessageSquareText, Check } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";

export default function MemoryStatus() {
  const { data } = useMemory();
  const mistakes = data.questions.reduce(
    (s, q) => s + q.mistakes.length,
    0
  );
  const reflections = data.questions.filter((q) => q.reflection).length;

  const stats = [
    { value: String(data.questions.length), label: "Solved questions", icon: Trophy },
    { value: String(reflections), label: "Notes & reflections", icon: FileText },
    { value: String(mistakes), label: "Recorded mistakes", icon: MessageSquareText },
    { value: String(data.quizResults.length), label: "Quiz sessions", icon: Trophy },
  ];

  return (
    <section className="memory-status" aria-label="AI memory status">
      <div className="memory-status-title">
        <span className="memory-pulse" />
        <span>
          <strong>Learning memory</strong>
          <small>
            Coach has access to questions, reflections, patterns, quiz history
            & mistakes
          </small>
        </span>
      </div>
      <div className="memory-stat-list">
        {stats.map(({ value, label, icon: Icon }) => (
          <div className="memory-stat" key={label}>
            <Icon size={15} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="memory-synced">
        <span>
          <Check size={13} />
        </span>
        <div>
          <strong>Memory synced</strong>
          <small>Full context loaded</small>
        </div>
      </div>
    </section>
  );
}

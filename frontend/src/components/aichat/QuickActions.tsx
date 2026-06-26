import {
  BrainCircuit,
  CalendarRange,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "Revision Plan",
    prompt: "What should I revise today? Create a prioritized revision plan from my due items.",
    icon: CalendarRange,
    tone: "blue",
  },
  {
    title: "Weak Areas",
    prompt: "Which pattern am I weakest at? Analyze my mistakes and low-confidence questions.",
    icon: Search,
    tone: "amber",
  },
  {
    title: "Quiz Me",
    prompt: "Generate 5 quiz questions from my mistakes and weak patterns.",
    icon: Sparkles,
    tone: "violet",
  },
  {
    title: "Explain Pattern",
    prompt: "Explain Sliding Window using examples from my solved questions and reflections.",
    icon: BrainCircuit,
    tone: "green",
  },
  {
    title: "Generate Interview Questions",
    prompt: "Generate 5 interview-style questions based on my weakest topics.",
    icon: FileText,
    tone: "blue",
  },
  {
    title: "Review My Reflection",
    prompt: "Review my latest reflections and tell me what I keep forgetting.",
    icon: MessageSquareText,
    tone: "violet",
  },
];

type Props = { onAction: (prompt: string) => void };

export default function QuickActions({ onAction }: Props) {
  return (
    <nav className="coach-quick-actions" aria-label="Quick coaching actions">
      <span>Quick actions</span>
      <div>
        {actions.map(({ title, prompt, icon: Icon, tone }) => (
          <button key={title} type="button" onClick={() => onAction(prompt)}>
            <span className={tone}>
              <Icon size={15} />
            </span>
            {title}
          </button>
        ))}
      </div>
    </nav>
  );
}

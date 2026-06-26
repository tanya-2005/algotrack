import { ArrowRight, Code2 } from "lucide-react";

const questions = [
  { title: "Minimum Window Substring", pattern: "Sliding Window", ago: "11 days ago", confidence: 3 },
  { title: "Course Schedule II", pattern: "Graph · Topological Sort", ago: "9 days ago", confidence: 2 },
  { title: "Merge Intervals", pattern: "Intervals", ago: "7 days ago", confidence: 4 },
];

function Confidence({ value }: { value: number }) {
  return <div className="rev-confidence" aria-label={`${value} out of 5 confidence`}>{[1, 2, 3, 4, 5].map((dot) => <span key={dot} className={dot <= value ? "filled" : ""} />)}</div>;
}

export default function QuestionsDue() {
  return (
    <section className="rev-panel">
      <div className="panel-heading"><div><span className="section-icon amber"><Code2 size={18} /></span><div><h2>Questions Due</h2><p>Recall before the memory fades</p></div></div><span className="count-badge">6 due</span></div>
      <div className="due-list">
        {questions.map((question, index) => (
          <article className="due-row" key={question.title}>
            <div className="due-main"><span className="due-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{question.title}</h3><p>{question.pattern}</p></div></div>
            <div className="due-meta"><small>Last seen</small><span>{question.ago}</span></div>
            <div className="due-meta confidence-meta"><small>Confidence</small><Confidence value={question.confidence} /></div>
            <button className="icon-button" aria-label={`Revise ${question.title}`}><ArrowRight size={17} /></button>
          </article>
        ))}
      </div>
      <button className="panel-link">View all questions <ArrowRight size={15} /></button>
    </section>
  );
}

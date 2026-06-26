import { ArrowRight, BrainCircuit } from "lucide-react";

const patterns = [
  { title: "Sliding Window", count: 24, ago: "14 days", confidence: "4.2" },
  { title: "Graph Traversal", count: 18, ago: "12 days", confidence: "3.4" },
  { title: "Dynamic Programming", count: 16, ago: "8 days", confidence: "3.8" },
];

export default function PatternsDue() {
  return (
    <section className="rev-panel">
      <div className="panel-heading"><div><span className="section-icon purple"><BrainCircuit size={18} /></span><div><h2>Patterns Due</h2><p>Rebuild your mental templates</p></div></div><span className="count-badge">3 due</span></div>
      <div className="pattern-due-list">
        {patterns.map((pattern, index) => (
          <article className="pattern-row" key={pattern.title}>
            <div className={`pattern-mark mark-${index + 1}`}><BrainCircuit size={19} /></div>
            <div className="pattern-row-main"><h3>{pattern.title}</h3><p>{pattern.count} questions · Last seen {pattern.ago}</p></div>
            <div className="pattern-score"><strong>{pattern.confidence}</strong><small>/ 5</small></div>
            <button className="icon-button" aria-label={`Open ${pattern.title}`}><ArrowRight size={17} /></button>
          </article>
        ))}
      </div>
      <button className="panel-link">View all patterns <ArrowRight size={15} /></button>
    </section>
  );
}

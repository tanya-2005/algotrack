import { Sparkles } from "lucide-react";

export default function RevisionHero() {
  return (
    <header className="rev-header">
      <div>
        <div className="rev-eyebrow"><Sparkles size={14} /> Memory reinforcement</div>
        <h1>Revision Center</h1>
        <p>Your personal recall system—built from what you solved, learned, and almost forgot.</p>
      </div>
      <div className="rev-header-meta">
        <span><span className="live-dot" /> Memory sync complete</span>
        <strong>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </strong>
      </div>
    </header>
  );
}

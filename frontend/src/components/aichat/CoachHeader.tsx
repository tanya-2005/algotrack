import { BrainCircuit, Sparkles } from "lucide-react";

export default function CoachHeader() {
  return (
    <header className="coach-hero">
      <div className="coach-hero-glow" />
      <div className="coach-heading">
        <span className="coach-orb"><BrainCircuit size={22} /></span>
        <div>
          <div className="coach-eyebrow"><Sparkles size={13} /> Memory-aware coaching</div>
          <h1>AI Coach</h1>
          <p>Your personal DSA coach, grounded in your solved questions, mistakes, patterns, notes, and reflections.</p>
        </div>
      </div>
      <div className="coach-ready"><span className="coach-live-dot" /><span><strong>Coach ready</strong><small>Full learning context loaded</small></span></div>
    </header>
  );
}

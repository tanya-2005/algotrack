import { Lightbulb, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function AIInsights() {
  return (
    <section className="rev-panel insights-card">
      <div className="panel-heading compact"><div><span className="section-icon purple"><Lightbulb size={18} /></span><div><span className="mini-label">AI observations</span><h2>Your learning signals</h2></div></div></div>
      <div className="insight-columns">
        <div><span className="insight-label struggle"><TrendingUp size={14} /> Needs attention</span><strong>Variable Sliding Window</strong><strong>Graph BFS edge cases</strong></div>
        <div><span className="insight-label strong"><Zap size={14} /> Strongest areas</span><strong>Arrays & Hashing</strong><strong>Two Pointers</strong></div>
      </div>
      <p className="ai-note"><Sparkles size={14} /> Your next quiz will prioritize window-shrinking conditions and BFS visited-state mistakes.</p>
    </section>
  );
}

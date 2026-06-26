import { ArrowRight, CircleAlert } from "lucide-react";

export default function ForgottenConcepts() {
  return (
    <section className="forgotten-card">
      <div className="forgotten-icon"><CircleAlert size={22} /></div>
      <div className="forgotten-copy"><span className="mini-label">Memory warning</span><h2>Forgotten Concepts</h2><p>These concepts haven't been revised for 30+ days.</p></div>
      <div className="forgotten-tags">
        <span><strong>Trie</strong><small>42 days</small></span>
        <span><strong>Bit Manipulation</strong><small>36 days</small></span>
        <span><strong>Union Find</strong><small>31 days</small></span>
      </div>
      <button className="forgotten-button">Recover concepts <ArrowRight size={16} /></button>
    </section>
  );
}

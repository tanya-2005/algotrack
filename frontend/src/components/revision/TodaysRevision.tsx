import { ArrowRight, BookOpenCheck, Check } from "lucide-react";

type Props = { started: boolean; onStart: () => void };

export default function TodaysRevision({ started, onStart }: Props) {
  return (
    <section className="today-card">
      <div className="today-title"><span className="section-icon blue"><BookOpenCheck size={20} /></span><div><h2>Today's Revision</h2><p>Your highest-impact recall queue</p></div></div>
      <div className="today-stats">
        <div><strong>6</strong><span>Questions due</span></div>
        <div><strong>3</strong><span>Patterns due</span></div>
        <div><strong>18<span> min</span></strong><span>Estimated time</span></div>
      </div>
      <button className="today-start" onClick={onStart}>{started ? <><Check size={17} /> Session started</> : <>Start revision <ArrowRight size={17} /></>}</button>
    </section>
  );
}

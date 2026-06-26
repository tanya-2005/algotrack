import {
  Target,
  BrainCircuit,
  Gauge,
  AlarmClock,
} from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { useMemory } from "../../context/MemoryContext";
import {
  getMemoryScore,
  getRevisionDueCount,
} from "../../lib/memoryEngine";

function StatsCard() {
  const { data } = useMemory();
  const solved = data.questions.length;
  const patterns = data.patterns.length;
  const memoryScore = getMemoryScore(data);
  const revisionDue = getRevisionDueCount(data);

  const questionsSolved = useCountUp(solved);
  const patternsLearned = useCountUp(patterns);
  const memoryScoreAnim = useCountUp(memoryScore);
  const revisionDueAnim = useCountUp(revisionDue);

  return (
    <div className="stats-grid">
      <div className="stat-card stat-blue">
        <div className="stat-icon">
          <Target size={22} />
        </div>
        <p className="stat-label">Questions Solved</p>
        <h2 className="stat-number">{questionsSolved}</h2>
        <span className="stat-change positive">From your log</span>
      </div>

      <div className="stat-card stat-purple">
        <div className="stat-icon">
          <BrainCircuit size={22} />
        </div>
        <p className="stat-label">Patterns Learned</p>
        <h2 className="stat-number">{patternsLearned}</h2>
        <span className="stat-change positive">Active patterns</span>
      </div>

      <div className="stat-card stat-green">
        <div className="stat-icon">
          <Gauge size={22} />
        </div>
        <p className="stat-label">Memory Score</p>
        <h2 className="stat-number">{memoryScoreAnim}%</h2>
        <span className="stat-change positive">Live retention</span>
      </div>

      <div className="stat-card stat-orange">
        <div className="stat-icon">
          <AlarmClock size={22} />
        </div>
        <p className="stat-label">Revision Due</p>
        <h2 className="stat-number">{revisionDueAnim}</h2>
        <span className="stat-change negative">Needs attention</span>
      </div>
    </div>
  );
}

export default StatsCard;

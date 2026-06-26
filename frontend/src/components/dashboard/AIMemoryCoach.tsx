import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemory } from "../../context/MemoryContext";
import {
  getForgottenConcepts,
  getImprovingPatterns,
  getMemoryRiskLevel,
  getRecommendedRevision,
} from "../../lib/memoryEngine";

function AIMemoryCoach() {
  const navigate = useNavigate();
  const { data } = useMemory();

  const forgetting = getForgottenConcepts(data).slice(0, 4);
  const improving = getImprovingPatterns(data);
  const recommended = getRecommendedRevision(data);
  const risk = getMemoryRiskLevel(data);

  return (
    <div className="ai-coach-card">
      <div className="ai-coach-glow" />

      <div className="ai-coach-header">
        <div className="ai-coach-title-row">
          <span className="ai-coach-emoji">🧠</span>
          <div>
            <h2>AI Memory Coach</h2>
            <p>Personalized retention intelligence</p>
          </div>
        </div>
        <Brain size={28} className="ai-coach-icon" />
      </div>

      <div className="memory-risk-row">
        <span className="memory-risk-label">Memory Risk Level</span>
        <span className={`memory-risk-badge ${risk.toLowerCase()}`}>
          {risk}
        </span>
      </div>

      <div className="ai-coach-grid">
        <div className="ai-coach-section ai-coach-forgetting">
          <h3>You are forgetting</h3>
          <ul>
            {forgetting.length > 0 ? (
              forgetting.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Nothing critical right now</li>
            )}
          </ul>
        </div>

        <div className="ai-coach-section ai-coach-improving">
          <h3>You are improving</h3>
          <ul>
            {improving.length > 0 ? (
              improving.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Keep revising to build momentum</li>
            )}
          </ul>
        </div>

        <div className="ai-coach-section ai-coach-recommended">
          <h3>Recommended</h3>
          <p className="ai-coach-action">
            Revise <strong>{recommended.pattern}</strong> today
          </p>
          <p className="ai-coach-action">
            Estimated Time: <strong>{recommended.duration}</strong>
          </p>
          <button
            className="ai-coach-btn"
            onClick={() =>
              navigate("/revision", {
                state: { focus: recommended.pattern },
              })
            }
          >
            Start Revision
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIMemoryCoach;

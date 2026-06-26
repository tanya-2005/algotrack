import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const revisionItems = [
  {
    pattern: "Trie",
    days: 112,
    confidence: 18,
    priority: "high" as const,
    featured: true,
  },
  {
    pattern: "Union Find",
    days: 85,
    confidence: 32,
    priority: "high" as const,
    featured: false,
  },
  {
    pattern: "Digit DP",
    days: 97,
    confidence: 41,
    priority: "medium" as const,
    featured: false,
  },
];

function Recommendations() {
  const navigate = useNavigate();
  const [featured, ...rest] = revisionItems;

  return (
    <div className="recommend-card">
      <div className="recommend-header">
        <Brain size={22} className="recommend-icon" />
        <div>
          <h2>Revision Queue</h2>
          <p>Patterns slowly fading from memory</p>
        </div>
      </div>

      <div className="revision-featured">
        <span className="priority-badge">🚨 Highest Priority</span>
        <h3>{featured.pattern}</h3>
        <div className="revision-featured-meta">
          <span>{featured.days} Days</span>
          <span className="confidence-low">{featured.confidence}% Confidence</span>
        </div>
      </div>

      <div className="revision-list">
        {rest.map((item) => (
          <div key={item.pattern} className="revision-item revision-item-sm">
            <div className="revision-info">
              <h4>{item.pattern}</h4>
              <span>{item.days} days · {item.confidence}% confidence</span>
            </div>
            <div className={`priority ${item.priority}`}>
              {item.priority}
            </div>
          </div>
        ))}
      </div>

      <div className="revision-forecast">
        <h4>Revision Forecast</h4>
        <div className="forecast-row">
          <span>Today</span>
          <span className="forecast-value">4 Questions</span>
        </div>
        <div className="forecast-row">
          <span>Tomorrow</span>
          <span className="forecast-value">7 Questions</span>
        </div>
        <div className="forecast-row">
          <span>This Week</span>
          <span className="forecast-value">23 Questions</span>
        </div>
      </div>

      <button
        className="revision-btn"
        onClick={() => navigate("/revision")}
      >
        Start Revision Session
      </button>
    </div>
  );
}

export default Recommendations;

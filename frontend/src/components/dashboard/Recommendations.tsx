import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemory } from "../../context/MemoryContext";
import {
  getRevisionForecast,
  getRevisionRecommendationItems,
} from "../../lib/memoryEngine";

function Recommendations() {
  const navigate = useNavigate();
  const { data } = useMemory();
  const revisionItems = getRevisionRecommendationItems(data);
  const forecast = getRevisionForecast(data);
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

      {featured ? (
        <div className="revision-featured">
          <span className="priority-badge">🚨 Highest Priority</span>
          <h3>{featured.pattern}</h3>
          <div className="revision-featured-meta">
            <span>{featured.days} Days</span>
            <span className="confidence-low">{featured.confidence}% Confidence</span>
          </div>
        </div>
      ) : (
        <div className="revision-featured">
          <span className="priority-badge">✅ All caught up</span>
          <h3>No patterns need urgent revision</h3>
        </div>
      )}

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
          <span className="forecast-value">{forecast.today} Questions</span>
        </div>
        <div className="forecast-row">
          <span>Tomorrow</span>
          <span className="forecast-value">{forecast.tomorrow} Questions</span>
        </div>
        <div className="forecast-row">
          <span>This Week</span>
          <span className="forecast-value">{forecast.thisWeek} Questions</span>
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

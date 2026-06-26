import { UserRound, Clock } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import {
  getAverageConfidence,
  getAverageRevisionGap,
  getAverageSolveTime,
  getFavoritePattern,
  getMostActiveTime,
  getStrongestPattern,
  getStrongestTopic,
  getWeakestPattern,
} from "../../lib/memoryEngine";

function LearnerProfile() {
  const { data } = useMemory();

  const insights = [
    { label: "Most Active Time", value: getMostActiveTime(data.questions) },
    { label: "Average Revision Gap", value: getAverageRevisionGap(data.questions) },
    { label: "Favorite Pattern", value: getFavoritePattern(data.questions) },
    { label: "Strongest Topic", value: getStrongestTopic(data.questions) },
  ];

  return (
    <div className="learner-profile-card">
      <div className="card-header">
        <UserRound size={22} className="card-header-icon" />
        <div>
          <h2>Learner Profile</h2>
          <p>Your DSA learning fingerprint</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-label">Strongest Pattern</span>
          <span className="profile-stat-value strong">
            {getStrongestPattern(data)}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">Weakest Pattern</span>
          <span className="profile-stat-value weak">
            {getWeakestPattern(data)}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">Average Confidence</span>
          <span className="profile-stat-value mono">
            {getAverageConfidence(data)}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">Average Solve Time</span>
          <span className="profile-stat-value mono">
            {getAverageSolveTime(data)}
          </span>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Learning Insights</h3>
        <div className="learning-insights-grid">
          {insights.map((item) => (
            <div key={item.label} className="learning-insight-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-productive-hour">
        <Clock size={16} />
        <div>
          <span className="profile-stat-label">Peak Study Window</span>
          <span className="productive-hour-value">
            {getMostActiveTime(data.questions)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LearnerProfile;

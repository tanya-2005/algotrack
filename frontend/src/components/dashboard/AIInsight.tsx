import { Sparkles } from "lucide-react";

const insights = [
  "You repeatedly forget DP state definition.",
  "Your Graph confidence is improving.",
  "You solve Sliding Window fastest.",
];

function AIInsight() {
  return (
    <div className="ai-insight-card">
      <div className="card-header">
        <Sparkles size={22} className="card-header-icon accent" />
        <div>
          <h2>AI Insight</h2>
          <p>Personalized learning signals</p>
        </div>
      </div>

      <ul className="insight-list">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

export default AIInsight;

import { TrendingUp } from "lucide-react";

const data = [
  { month: "Jan", score: 62 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 71 },
  { month: "Apr", score: 79 },
  { month: "May", score: 87 },
];

const maxScore = 100;
const chartHeight = 120;

function MemoryScoreTrend() {
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = chartHeight - (d.score / maxScore) * chartHeight;
    return `${x},${y}`;
  });

  const areaPoints = `0,${chartHeight} ${points.join(" ")} 100,${chartHeight}`;

  return (
    <div className="memory-trend-card">
      <div className="card-header">
        <TrendingUp size={22} className="card-header-icon accent" />
        <div>
          <h2>Memory Score Evolution</h2>
          <p>Your retention growth over time</p>
        </div>
        <span className="memory-trend-badge">+25% since Jan</span>
      </div>

      <div className="memory-trend-chart">
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="memory-trend-svg"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#trendGradient)" />
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = chartHeight - (d.score / maxScore) * chartHeight;
            return (
              <circle
                key={d.month}
                cx={x}
                cy={y}
                r="2.5"
                fill="#8b5cf6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <div className="memory-trend-labels">
          {data.map((d) => (
            <div key={d.month} className="memory-trend-label">
              <span className="memory-trend-month">{d.month}</span>
              <span className="memory-trend-score">{d.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MemoryScoreTrend;

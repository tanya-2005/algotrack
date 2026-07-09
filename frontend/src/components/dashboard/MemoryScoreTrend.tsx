import { TrendingUp } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { getMemoryScoreTrendData } from "../../lib/memoryEngine";

const maxScore = 100;
const chartHeight = 120;

function MemoryScoreTrend() {
  const { data: memoryData } = useMemory();
  const data = getMemoryScoreTrendData(memoryData.questions);
  const denom = Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = (i / denom) * 100;
    const y = chartHeight - (d.score / maxScore) * chartHeight;
    return `${x},${y}`;
  });

  const areaPoints =
    data.length > 0
      ? `0,${chartHeight} ${points.join(" ")} 100,${chartHeight}`
      : "";

  const change =
    data.length > 1 ? data[data.length - 1].score - data[0].score : 0;
  const trendLabel =
    data.length > 1
      ? `${change >= 0 ? "+" : ""}${change}% since ${data[0].month}`
      : "Not enough data yet";

  return (
    <div className="memory-trend-card">
      <div className="card-header">
        <TrendingUp size={22} className="card-header-icon accent" />
        <div>
          <h2>Memory Score Evolution</h2>
          <p>Your retention growth over time</p>
        </div>
        <span className="memory-trend-badge">{trendLabel}</span>
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
            const x = (i / denom) * 100;
            const y = chartHeight - (d.score / maxScore) * chartHeight;
            return (
              <circle
                key={`${d.month}-${i}`}
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
          {data.map((d, i) => (
            <div key={`${d.month}-${i}`} className="memory-trend-label">
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

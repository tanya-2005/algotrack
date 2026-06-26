import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import {
  predictRetention,
} from "../../lib/memoryEngine";
import type { PredictionHorizon } from "../../lib/types";

function MemoryPrediction() {
  const { data } = useMemory();
  const [animated, setAnimated] = useState(false);
  const [horizon, setHorizon] = useState<PredictionHorizon>(7);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, [horizon]);

  const topPatterns = [...data.patterns]
    .map((p) => {
      const related = data.questions.filter((q) => q.pattern === p.name);
      const avg =
        related.length > 0
          ? Math.round(
              related.reduce(
                (s, q) => s + predictRetention(q, horizon),
                0
              ) / related.length
            )
          : 0;
      return { pattern: p.name, retention: avg };
    })
    .sort((a, b) => a.retention - b.retention)
    .slice(0, 3);

  const level = (r: number) =>
    r < 30 ? "critical" : r < 60 ? "warning" : "strong";

  return (
    <div className="memory-prediction-card">
      <div className="card-header-row">
        <div className="card-header">
          <Sparkles size={22} className="card-header-icon accent" />
          <div>
            <h2>Memory Prediction</h2>
            <p>Predicted retention in {horizon} days</p>
          </div>
        </div>
        <div className="horizon-toggle">
          {([3, 7, 14] as PredictionHorizon[]).map((h) => (
            <button
              key={h}
              type="button"
              className={horizon === h ? "active" : ""}
              onClick={() => setHorizon(h)}
            >
              {h}d
            </button>
          ))}
        </div>
      </div>

      <div className="prediction-list">
        {topPatterns.map((item) => (
          <div
            key={item.pattern}
            className={`prediction-row ${level(item.retention)}`}
          >
            <div className="prediction-info">
              <span className="prediction-pattern">{item.pattern}</span>
              <span className="prediction-meta">
                → {item.retention}% retention in {horizon} days
              </span>
            </div>
            <div className="prediction-bar-track">
              <div
                className={`prediction-bar-fill ${level(item.retention)}`}
                style={{
                  width: animated ? `${item.retention}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryPrediction;

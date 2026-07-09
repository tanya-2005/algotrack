import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { getPatternStats } from "../../lib/memoryEngine";

function getBarColor(mastery: number) {
  if (mastery >= 80) return "bar-green";
  if (mastery >= 50) return "bar-yellow";
  if (mastery >= 30) return "bar-orange";
  return "bar-red";
}

function PatternMastery() {
  const { data } = useMemory();
  const [animated, setAnimated] = useState(false);

  const patterns = data.patterns
    .map((p) => ({
      name: p.name,
      mastery: getPatternStats(data, p).retention,
    }))
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 6);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pattern-mastery-card">
      <div className="card-header">
        <Layers size={22} className="card-header-icon" />
        <div>
          <h2>Pattern Mastery</h2>
          <p>Confidence across your core patterns</p>
        </div>
      </div>

      <div className="mastery-list">
        {patterns.map((pattern) => (
          <div key={pattern.name} className="mastery-row">
            <div className="mastery-row-header">
              <span className="mastery-name">{pattern.name}</span>
              <span className="mastery-percent">{pattern.mastery}%</span>
            </div>
            <div className="mastery-bar-track">
              <div
                className={`mastery-bar-fill ${getBarColor(pattern.mastery)}`}
                style={{
                  width: animated ? `${pattern.mastery}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatternMastery;

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";

const patterns = [
  { name: "Sliding Window", mastery: 92 },
  { name: "Binary Search", mastery: 81 },
  { name: "Graphs", mastery: 72 },
  { name: "DP", mastery: 42 },
  { name: "Trie", mastery: 18 },
];

function getBarColor(mastery: number) {
  if (mastery >= 80) return "bar-green";
  if (mastery >= 50) return "bar-yellow";
  if (mastery >= 30) return "bar-orange";
  return "bar-red";
}

function PatternMastery() {
  const [animated, setAnimated] = useState(false);

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

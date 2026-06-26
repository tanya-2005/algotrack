import { BarChart3 } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { formatRelative } from "../../lib/memoryEngine";

export default function QuizResultsHistory() {
  const { data } = useMemory();
  const results = data.quizResults.slice(0, 7).reverse();
  const maxScore = 10;

  return (
    <section className="rev-panel quiz-history-card">
      <div className="panel-heading">
        <div>
          <span className="section-icon purple">
            <BarChart3 size={18} />
          </span>
          <div>
            <h2>Past Quiz Performance</h2>
            <p>Track your recall trend over time</p>
          </div>
        </div>
      </div>

      <div className="quiz-history-chart">
        {results.map((r) => {
          const pct = (r.score / r.total) * 100;
          return (
            <div key={r.id} className="quiz-history-bar-row">
              <span className="quiz-history-label">
                {formatRelative(r.date)}
              </span>
              <div className="quiz-history-bar-track">
                <div
                  className="quiz-history-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="quiz-history-score mono">
                {r.score}/{r.total}
              </span>
            </div>
          );
        })}
      </div>

      <div className="quiz-history-summary">
        <span>
          Last week avg:{" "}
          <strong className="mono">
            {results.length > 0
              ? (
                  results.reduce((s, r) => s + r.score, 0) /
                  results.length
                ).toFixed(1)
              : 0}
            /{maxScore}
          </strong>
        </span>
      </div>
    </section>
  );
}

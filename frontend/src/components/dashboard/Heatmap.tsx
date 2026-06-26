import { CalendarDays, Flame } from "lucide-react";

function Heatmap() {
  const weeks = Array.from({ length: 18 });
  const days = Array.from({ length: 5 });

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <CalendarDays size={24} />
          <div>
            <h2>Consistency Tracker</h2>
            <p>Your revision activity over the last 18 weeks</p>
          </div>
        </div>

        <div className="streak-badge">
          <Flame size={18} />
          <span>18 Day Revision Streak</span>
        </div>
      </div>

      <div className="heatmap-grid">
        {weeks.map((_, weekIndex) => (
          <div key={weekIndex} className="heatmap-column">
            {days.map((_, dayIndex) => {
              const levels = [
                "level-0",
                "level-1",
                "level-2",
                "level-3",
                "level-4",
              ];

              return (
                <div
                  key={dayIndex}
                  className={`heat-cell ${
                    levels[(weekIndex + dayIndex) % 5]
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Best Day</span>
          <span className="heatmap-stat-value">Saturday</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Questions Logged</span>
          <span className="heatmap-stat-value">234</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Revisions Completed</span>
          <span className="heatmap-stat-value">81</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Longest Streak</span>
          <span className="heatmap-stat-value">24 Days</span>
        </div>
      </div>

      <div className="heatmap-footer">
        <div className="legend">
          <span>Less</span>
          <div className="legend-box legend-0"></div>
          <div className="legend-box legend-1"></div>
          <div className="legend-box legend-2"></div>
          <div className="legend-box legend-3"></div>
          <div className="legend-box legend-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;

import { CalendarDays, Flame } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { getHeatmapData } from "../../lib/memoryEngine";

const LEVEL_CLASSES = ["level-0", "level-1", "level-2", "level-3", "level-4"];

function Heatmap() {
  const { data } = useMemory();
  const heatmap = getHeatmapData(data.questions);

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
          <span>{heatmap.currentStreak} Day Revision Streak</span>
        </div>
      </div>

      <div className="heatmap-grid">
        {heatmap.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-column">
            {week.map((level, dayIndex) => (
              <div
                key={dayIndex}
                className={`heat-cell ${LEVEL_CLASSES[level]}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="heatmap-stats">
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Best Day</span>
          <span className="heatmap-stat-value">{heatmap.bestDay}</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Questions Logged</span>
          <span className="heatmap-stat-value">{heatmap.questionsLogged}</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Revisions Completed</span>
          <span className="heatmap-stat-value">{heatmap.revisionsCompleted}</span>
        </div>
        <div className="heatmap-stat">
          <span className="heatmap-stat-label">Longest Streak</span>
          <span className="heatmap-stat-value">{heatmap.longestStreak} Days</span>
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

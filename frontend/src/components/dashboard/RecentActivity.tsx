import { History } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { groupActivitiesByDate } from "../../lib/memoryEngine";

function RecentActivity() {
  const { data } = useMemory();
  const groups = groupActivitiesByDate(data.activities).slice(0, 5);

  return (
    <div className="activity-card">
      <div className="activity-header">
        <History className="activity-icon" />
        <div>
          <h2>Recent Activity</h2>
          <p>Your learning timeline</p>
        </div>
      </div>

      <div className="activity-timeline">
        {groups.map((group) => (
          <div key={group.label} className="timeline-group">
            <span className="timeline-date-label">{group.label}</span>

            {group.items.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className={`timeline-dot ${item.type}`} />
                <div className="timeline-content">
                  <p>
                    {item.text} <strong>{item.highlight}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;

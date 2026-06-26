import { BookOpenCheck, Check, RotateCcw, SkipForward } from "lucide-react";
import { useMemory } from "../../context/MemoryContext";
import { getEstimatedRevisionTime } from "../../lib/memoryEngine";

export default function RevisionQueuePanel() {
  const {
    data,
    completeQueueItem,
    skipQueueItem,
    reviewAgainQueueItem,
    memoryScore,
  } = useMemory();

  const items = data.revisionQueue;
  const completed = items.filter((i) => i.completed).length;
  const active = items.filter((i) => !i.skipped);
  const total = active.length;

  return (
    <section className="revision-queue-panel">
      <div className="revision-queue-header">
        <div className="today-title">
          <span className="section-icon blue">
            <BookOpenCheck size={20} />
          </span>
          <div>
            <h2>Today&apos;s Revision Queue</h2>
            <p>Questions, patterns, and reflections due today</p>
          </div>
        </div>
        <div className="revision-queue-meta">
          <span>
            Estimated Time:{" "}
            <strong>{getEstimatedRevisionTime(items)}</strong>
          </span>
          <span className="mono">
            Progress: {completed} / {total} completed
          </span>
          <span>
            Memory Score: <strong>{memoryScore}%</strong>
          </span>
        </div>
      </div>

      <div className="revision-queue-progress">
        <div
          className="revision-queue-progress-fill"
          style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
        />
      </div>

      <ul className="revision-queue-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`revision-queue-item ${
              item.completed ? "done" : ""
            } ${item.skipped ? "skipped" : ""}`}
          >
            <label>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => completeQueueItem(item.id)}
              />
              <span>{item.title}</span>
              <small>{item.type}</small>
            </label>
            <div className="revision-queue-actions">
              {!item.completed && (
                <>
                  <button
                    type="button"
                    title="Skip"
                    onClick={() => skipQueueItem(item.id)}
                  >
                    <SkipForward size={14} /> Skip
                  </button>
                  <button
                    type="button"
                    title="Review Again"
                    onClick={() => reviewAgainQueueItem(item.id)}
                  >
                    <RotateCcw size={14} /> Review Again
                  </button>
                </>
              )}
              {item.completed && (
                <span className="done-label">
                  <Check size={14} /> Done
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

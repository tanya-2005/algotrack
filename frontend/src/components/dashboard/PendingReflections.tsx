import { NotebookPen } from "lucide-react";

function PendingReflections() {
  return (
    <div className="reflection-card">

      <div className="reflection-header">

        <NotebookPen
          size={24}
          className="reflection-icon"
        />

        <div>
          <h2>Pending Reflections</h2>
          <p>
            Questions waiting for notes and learnings
          </p>
        </div>

      </div>

      <div className="reflection-list">

        <div className="reflection-item">

          <div>
            <h3>Word Break</h3>
            <span>Dynamic Programming</span>
          </div>

          <button>Reflect</button>

        </div>

        <div className="reflection-item">

          <div>
            <h3>Rotting Oranges</h3>
            <span>Graphs & BFS</span>
          </div>

          <button>Reflect</button>

        </div>

        <div className="reflection-item">

          <div>
            <h3>Longest Palindrome</h3>
            <span>Two Pointer</span>
          </div>

          <button>Reflect</button>

        </div>

      </div>

    </div>
  );
}

export default PendingReflections;
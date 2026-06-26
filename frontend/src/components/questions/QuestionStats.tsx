import { useEffect, useState } from "react";
import { getQuestionStats } from "../../services/statsService";


type Props = {
  refreshKey: number;
};

function QuestionStats({
  refreshKey,
}: Props) {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalPatterns: 0,
    retention: 0,
    dueToday: 0,
  });

  console.log("REFRESH KEY:", refreshKey);
  useEffect(() => {
    loadStats();
    console.log("LOADING STATS");
  }, [refreshKey]);

  async function loadStats() {
  const data =
    await getQuestionStats();

  console.log(
    "STATS DATA:",
    data
  );

  setStats(data);
}

  return (
    <div className="question-stats">

      <div className="stat-pill questions">
        <span className="stat-number">
          {stats.totalQuestions}
        </span>

        <span className="stat-label">
          Questions
        </span>
      </div>

      <div className="stat-pill patterns">
        <span className="stat-number">
          {stats.totalPatterns}
        </span>

        <span className="stat-label">
          Patterns
        </span>
      </div>

      <div className="stat-pill retention">
        <span className="stat-number">
          {stats.retention}%
        </span>

        <span className="stat-label">
          Retention
        </span>
      </div>

      <div className="stat-pill due">
        <span className="stat-number">
          {stats.dueToday}
        </span>

        <span className="stat-label">
          Due Today
        </span>
      </div>

    </div>
  );
}

export default QuestionStats;

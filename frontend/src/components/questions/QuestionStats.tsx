import { useEffect, useRef, useState } from "react";
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadStats();
    return () => {
      mountedRef.current = false;
    };
  }, [refreshKey]);

  async function loadStats(retryCount = 0) {
    try {
      const data = await getQuestionStats();
      if (!mountedRef.current) return;
      setStats(data);
    } catch (error) {
      console.error(error);
      if (!mountedRef.current) return;
      // One automatic retry covers a transient network hiccup (e.g. a
      // brief DNS/connection blip) without the user needing to refresh.
      if (retryCount < 1) {
        setTimeout(() => {
          if (mountedRef.current) loadStats(retryCount + 1);
        }, 800);
      }
    }
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

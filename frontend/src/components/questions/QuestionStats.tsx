import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getQuestionStats } from "../../services/statsService";
import { useMemory } from "../../context/MemoryContext";
import { isDemoMode } from "../../lib/demoMode";
import { getDueTodayQuestions, getOverdueQuestions } from "../../lib/memoryEngine";


type Props = {
  refreshKey: number;
};

function QuestionStats({
  refreshKey,
}: Props) {
  const { data: memoryData } = useMemory();
  const demoMode = isDemoMode();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalPatterns: 0,
    retention: 0,
    dueToday: 0,
  });
  const mountedRef = useRef(true);

  const demoStats = useMemo(() => {
    const questions = memoryData.questions;
    const totalPatterns = new Set(questions.map((q) => q.topic)).size;
    const avgConfidence =
      questions.length > 0
        ? questions.reduce((sum, q) => sum + q.confidence, 0) / questions.length
        : 0;
    const dueToday =
      getDueTodayQuestions(questions).length +
      getOverdueQuestions(questions).length;

    return {
      totalQuestions: questions.length,
      totalPatterns,
      retention: Math.round((avgConfidence / 5) * 100),
      dueToday,
    };
  }, [memoryData.questions]);

  const loadStats = useCallback(async (retryCount = 0) => {
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
          // Safe self-reference: this only runs async, after `loadStats`
          // has already been fully assigned by useCallback.
          // eslint-disable-next-line react-hooks/immutability
          if (mountedRef.current) loadStats(retryCount + 1);
        }, 800);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (demoMode) return;

    loadStats();
    return () => {
      mountedRef.current = false;
    };
  }, [refreshKey, demoMode, loadStats]);

  const display = demoMode ? demoStats : stats;

  return (
    <div className="question-stats">

      <div className="stat-pill questions">
        <span className="stat-number">
          {display.totalQuestions}
        </span>

        <span className="stat-label">
          Questions
        </span>
      </div>

      <div className="stat-pill patterns">
        <span className="stat-number">
          {display.totalPatterns}
        </span>

        <span className="stat-label">
          Patterns
        </span>
      </div>

      <div className="stat-pill retention">
        <span className="stat-number">
          {display.retention}%
        </span>

        <span className="stat-label">
          Retention
        </span>
      </div>

      <div className="stat-pill due">
        <span className="stat-number">
          {display.dueToday}
        </span>

        <span className="stat-label">
          Due Today
        </span>
      </div>

    </div>
  );
}

export default QuestionStats;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Shapes, TrendingUp, Clock } from "lucide-react";
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

      <div className="q-stat-card q-stat-questions">
        <div className="q-stat-top">
          <span className="q-stat-label">Questions</span>
          <BookOpen size={16} className="q-stat-icon" />
        </div>
        <span className="q-stat-number">
          {display.totalQuestions}
        </span>
      </div>

      <div className="q-stat-card q-stat-patterns">
        <div className="q-stat-top">
          <span className="q-stat-label">Patterns</span>
          <Shapes size={16} className="q-stat-icon" />
        </div>
        <span className="q-stat-number">
          {display.totalPatterns}
        </span>
      </div>

      <div className="q-stat-card q-stat-retention">
        <div className="q-stat-top">
          <span className="q-stat-label">Retention</span>
          <TrendingUp size={16} className="q-stat-icon" />
        </div>
        <span className="q-stat-number">
          {display.retention}%
        </span>
      </div>

      <div className="q-stat-card q-stat-due">
        <div className="q-stat-top">
          <span className="q-stat-label">Due Today</span>
          <Clock size={16} className="q-stat-icon" />
        </div>
        <span className="q-stat-number">
          {display.dueToday}
        </span>
      </div>

    </div>
  );
}

export default QuestionStats;

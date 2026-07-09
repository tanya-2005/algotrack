import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import ReflectionPreview from "./ReflectionPreview";
import ReflectionPanel from "./ReflectionPanel";
import { getQuestions } from "../../services/questionservice";
import { useMemory } from "../../context/MemoryContext";
import { isDemoMode } from "../../lib/demoMode";
import { questionToRow } from "../../lib/demoQuestionAdapter";

type Props = {
  refreshKey: number;
  search: string;
  difficultyFilter: string;
};

function QuestionTable({
  refreshKey,
  search,
  difficultyFilter,
}: Props) {
  const { data: memoryData } = useMemory();
  const demoMode = isDemoMode();
  const demoQuestions = useMemo(
    () => memoryData.questions.map(questionToRow),
    [memoryData.questions]
  );
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<any>(null);
  const [loading, setLoading] = useState(!demoMode);
  const [loadError, setLoadError] = useState(false);
  const mountedRef = useRef(true);

  const loadQuestions = useCallback(async (retryCount = 0) => {
    try {
      setLoadError(false);
      const data = await getQuestions();
      if (!mountedRef.current) return;
      setQuestions([...(data || [])]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (!mountedRef.current) return;
      // One automatic retry covers a transient network hiccup (e.g. a
      // brief DNS/connection blip) without the user needing to refresh.
      if (retryCount < 1) {
        setTimeout(() => {
          // Safe self-reference: this only runs async, after
          // `loadQuestions` has already been fully assigned by useCallback.
          // eslint-disable-next-line react-hooks/immutability
          if (mountedRef.current) loadQuestions(retryCount + 1);
        }, 800);
        return;
      }
      setLoadError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (demoMode) return;

    loadQuestions();
    return () => {
      mountedRef.current = false;
    };
  }, [refreshKey, demoMode, loadQuestions]);

  // Defensive: guarantee at most one row per question id, regardless of
  // what the fetch returned, so a duplicate id can never render twice.
  const uniqueQuestions = Array.from(
    new Map(
      (demoMode ? demoQuestions : questions).map((q) => [q.id, q])
    ).values()
  );

  const filteredQuestions = uniqueQuestions.filter((q) => {
  const matchesSearch =
  q.title
    ?.toLowerCase()
    .includes((search || "").toLowerCase());

const matchesDifficulty =
  !difficultyFilter ||
  difficultyFilter === "All" ||
  q.difficulty?.toLowerCase() ===
    difficultyFilter.toLowerCase();

  return (
    matchesSearch &&
    matchesDifficulty
  );
});

  return (
    <>
      <div className="question-table">
        <div className="table-header">
          <span>Question</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span />
        </div>

        {loading && !loadError && (
          <div className="table-state-row">
            <span>Loading your questions…</span>
          </div>
        )}

        {loadError && (
          <div className="table-state-row">
            <span>
              Couldn't load your questions. Check your connection and try
              again.
            </span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadQuestions();
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && filteredQuestions.length === 0 && (
          <div className="table-state-row">
            <span>No questions logged yet.</span>
          </div>
        )}

        {filteredQuestions.map((q) => (
          <div
            className="question-row"
            key={q.id}
            onClick={() => {
              setSelectedQuestion(q);
            }}
          >
            <span className="question-name">
              {q.title}
            </span>

            <span className="question-topic">
              {q.topic}
            </span>

            <span
              className={`difficulty ${(q.difficulty || "").toLowerCase()}`}
            >
              {q.difficulty}
            </span>

            <ChevronRight size={16} className="row-chevron" />

            <div className="reflection-preview-wrapper">
              <ReflectionPreview
                trigger={
                  q.memory_trigger || "No Trigger"
                }
                mistake={
                  q.mistakes || "No Mistakes"
                }
                pattern={q.topic}
              />
            </div>
          </div>
        ))}
      </div>

      <ReflectionPanel
        key={selectedQuestion?.id ?? "none"}
        question={selectedQuestion}
        onSave={async () => {
          // In Demo Mode the useEffect above already reacts to
          // memoryData.questions changing - re-fetching from Supabase here
          // would just overwrite the table with an empty (no-session) result.
          if (!demoMode) await loadQuestions();
        }}
        onClose={() => setSelectedQuestion(null)}
      />
    </>
  );
}

export default QuestionTable;

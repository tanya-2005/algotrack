import { useEffect, useState } from "react";
import ReflectionPreview from "./ReflectionPreview";
import ReflectionPanel from "./ReflectionPanel";
import { getQuestions } from "../../services/questionservice";

type Props = {
  search: string;
  difficultyFilter: string;
};

function QuestionTable({
  search,
  difficultyFilter,
}: Props) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions(retryCount = 0) {
    try {
      setLoadError(false);
      const data = await getQuestions();
      setQuestions([...(data || [])]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      // One automatic retry covers a transient network hiccup (e.g. a
      // brief DNS/connection blip) without the user needing to refresh.
      if (retryCount < 1) {
        setTimeout(() => loadQuestions(retryCount + 1), 800);
        return;
      }
      setLoadError(true);
      setLoading(false);
    }
  }

  const filteredQuestions = questions.filter((q) => {
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
      <div className="questions-table">
        <div className="table-header">
          <span>Question</span>
          <span>Topic</span>
          <span>Difficulty</span>
        </div>

        {loadError && (
          <div className="question-row" style={{ cursor: "default" }}>
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
          <div className="question-row" style={{ cursor: "default" }}>
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
              className={`difficulty ${q.difficulty}`}
            >
              {q.difficulty}
            </span>

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
        question={selectedQuestion}
        onSave={() => loadQuestions()}
        onClose={() => setSelectedQuestion(null)}
      />
    </>
  );
}

export default QuestionTable;

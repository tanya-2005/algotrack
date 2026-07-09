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

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const data = await getQuestions();
      setQuestions([...(data || [])]);
    } catch (error) {
      console.error(error);
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
        onSave={loadQuestions}
        onClose={() => setSelectedQuestion(null)}
      />
    </>
  );
}

export default QuestionTable;
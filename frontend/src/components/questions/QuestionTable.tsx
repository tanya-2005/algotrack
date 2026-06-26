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

      console.log("FRESH DATA:", data);

      setQuestions([...(data || [])]);
      console.log("STATE UPDATED");
    } catch (error) {
      console.error(error);
    }
  }
  console.log("TABLE QUESTIONS:", questions);


  console.log("SEARCH PROP:", search);
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

console.log("FILTER:", difficultyFilter);
console.log("FILTERED:", filteredQuestions);

console.log("SEARCH:", search);
console.log("FILTER:", difficultyFilter);
console.log("QUESTIONS:", questions);
console.log("FILTERED:", filteredQuestions);

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
              console.log(q);
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
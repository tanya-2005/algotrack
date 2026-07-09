import { Plus } from "lucide-react";

type QuestionHeaderProps = {
  onLogQuestion: () => void;
};

function QuestionHeader({
  onLogQuestion,
}: QuestionHeaderProps) {
  return (
    <div className="question-header">
      <div className="questions-title">
        <h1>My Questions</h1>

        <p>
          Track reflections, revisit mistakes,
          and strengthen long-term retention.
        </p>
      </div>

      <button
        className="add-question-btn"
        onClick={onLogQuestion}
      >
        <Plus size={18} />
        <span>Add Reflection</span>
      </button>
    </div>
  );
}

export default QuestionHeader;

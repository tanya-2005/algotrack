import "../../styles/patterns.css";

interface Props {
  questions: any[];
}

export default function PatternQuestions({
  questions,
}: Props) {
  return (
    <div className="questions-card">
      <div className="section-top">
        <h2>Questions Using This Pattern</h2>
        <span>{questions.length} Questions</span>
      </div>

      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        questions.map((question) => (
          <div
            key={question.id}
            className="question-row"
          >
            <div>
              <h4>{question.title}</h4>

              <p>{question.difficulty}</p>
            </div>

            <span className="last-seen">
              {new Date(
                question.created_at
              ).toLocaleDateString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
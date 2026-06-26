import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type ReflectionPanelProps = {
  question: any;
  onClose: () => void;
  onSave?: () => Promise<void>;
};

const patterns = [
  "Arrays",
  "Hashing",
  "Prefix Sum",
  "Sliding Window",
  "Two Pointers",
  "Binary Search",
  "Stack",
  "Monotonic Stack",
  "Queue",
  "Linked List",
  "Trees",
  "Trie",
  "Graph BFS",
  "Graph DFS",
  "Union Find",
  "Topological Sort",
  "Heap / Priority Queue",
  "Greedy",
  "Dynamic Programming",
  "Backtracking",
  "Bit Manipulation",
];

export default function ReflectionPanel({
  question,
  onClose,
  onSave,
}: ReflectionPanelProps) {
  if (!question) return null;

  const [difficulty, setDifficulty] = useState(
    question.difficulty || ""
  );

  const [confidence, setConfidence] = useState(
    question.confidence || 3
  );

  const [pattern, setPattern] = useState(
    question.pattern || question.topic || ""
  );



  const [reflection, setReflection] = useState(
    question.reflection || ""
  );

  const [mistakes, setMistakes] = useState(
    question.mistakes || ""
  );

  const [memoryTrigger, setMemoryTrigger] = useState(
    question.memory_trigger || ""
  );

  const [timeTaken, setTimeTaken] = useState(
    question.time_taken || ""
  );

  const [questionName, setQuestionName] = useState(
    question.title || ""
  );

  const isNew = question.isNew === true;
  useEffect(() => {
    if (!question) return;

    setQuestionName(question.title || "");
    setDifficulty(question.difficulty || "");
    setPattern(question.topic || "");
    setConfidence(question.confidence || 3);
    setReflection(question.reflection || "");
    setMistakes(question.mistakes || "");
    setMemoryTrigger(question.memory_trigger || "");
    setTimeTaken(question.time_taken || "");
  }, [question]);

  const handleSave = async () => {
    console.log("QUESTION:", question);
    console.log("IS NEW:", question.isNew);
    console.log("ID:", question.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const payload = {
      title: questionName,
      difficulty,
      topic: pattern,
      confidence,
      reflection,
      mistakes,
      memory_trigger: memoryTrigger,
      time_taken: timeTaken,
    };

    let error;

    if (question.id && !question.isNew) {

      console.log("UPDATE RUNNING");
      console.log("PAYLOAD:", payload);
      const result = await supabase
        .from("problems")
        .update(payload)
        .eq("id", question.id)
        .select();

      console.log("UPDATE RESULT:", result);

      error = result.error;

    } else {
      const result = await supabase
        .from("problems")
        .insert([
          {
            user_id: user.id,
            ...payload,
          },
        ])
        .select();

      console.log("INSERT RESULT:", result);

      error = result.error;
    }

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    console.log("SAVE SUCCESS");

    alert("Question Saved 🚀");

    console.log("CALLING ONSAVE");


    if (onSave) {
      await onSave();
    }

    console.log("ONSAVE FINISHED");


    onClose();


  };

  const handleDelete = async () => {
    if (!question.id) return;

    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", question.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Question Deleted 🗑️");
    onClose();
  };

  console.log("RENDER QUESTION:", question);
  console.log("RENDER ID:", question.id);
  console.log("RENDER isNew:", isNew);

  return (
    <div
      className="reflection-overlay"
      onClick={onClose}
    >
      <div
        className="reflection-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="reflection-header">
          <div>
            {isNew ? (
              <h2>Log Question</h2>
            ) : (
              <h2>{question.title}</h2>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {question.id && (
              <button
                style={{
                  background: "red",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "22px",
                  cursor: "pointer",
                }}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}

            <button
              className="save-btn"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        {isNew && (
          <div className="reflection-section">
            <h3>Question Name</h3>
            <input
              type="text"
              className="question-name-input"
              value={questionName}
              onChange={(e) => setQuestionName(e.target.value)}
              placeholder="e.g. Two Sum, Word Break..."
            />
          </div>
        )}

        {/* Difficulty */}

        <div className="reflection-section">
          <h3>Difficulty</h3>

          <div className="difficulty-picker">
            {["Easy", "Medium", "Hard"].map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setDifficulty(level)
                  }
                  className={
                    difficulty === level
                      ? `difficulty-pill active ${level.toLowerCase()}`
                      : "difficulty-pill"
                  }
                >
                  {level}
                </button>
              )
            )}
          </div>
        </div>

        {/* Pattern */}

        <div className="reflection-section">
          <h3>Pattern</h3>

          <select
            value={pattern}
            onChange={(e) =>
              setPattern(e.target.value)
            }
          >
            <option value="">
              Select Pattern
            </option>

            {patterns.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence */}

        <div className="reflection-section">
          <h3>Confidence</h3>

          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() =>
                  setConfidence(star)
                }
                className={
                  star <= confidence
                    ? "star active"
                    : "star"
                }
              >
                ★
              </span>
            ))}
          </div>

          <small>
            Used for revision scheduling
          </small>
        </div>

        {/* Reflection */}

        <div className="reflection-section">
          <h3>Reflection</h3>

          <textarea
            value={reflection}
            onChange={(e) =>
              setReflection(e.target.value)
            }
            rows={5}
            placeholder="What clicked? What should future you remember?"
          />
        </div>

        {/* Mistakes */}

        <div className="reflection-section">
          <h3>Mistakes Made</h3>

          <textarea
            value={mistakes}
            onChange={(e) =>
              setMistakes(e.target.value)
            }
            rows={4}
            placeholder="Forgot memoization, wrong invariant, off-by-one..."
          />
        </div>

        {/* Memory Trigger */}

        <div className="reflection-section">
          <h3>Memory Trigger</h3>

          <textarea
            value={memoryTrigger}
            onChange={(e) =>
              setMemoryTrigger(
                e.target.value
              )
            }
            rows={2}
            placeholder="Short sentence you'll instantly remember"
          />
        </div>

        {/* Time */}

        <div className="reflection-section">
          <h3>Time Taken</h3>

          <select
            value={timeTaken}
            onChange={(e) =>
              setTimeTaken(
                e.target.value
              )
            }
          >
            <option value="">
              Select
            </option>

            <option>
              Under 15 min
            </option>

            <option>
              15-30 min
            </option>

            <option>
              30-60 min
            </option>

            <option>
              60+ min
            </option>

            <option>
              Needed Solution
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
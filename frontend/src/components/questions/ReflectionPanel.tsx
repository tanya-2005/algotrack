import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { isDemoMode } from "../../lib/demoMode";
import { useMemory } from "../../context/MemoryContext";

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
  // All hooks must run unconditionally on every render (React's rules of
  // hooks) - the "no question yet" early return happens below, after every
  // hook has been declared, not before.
  const [difficulty, setDifficulty] = useState(
    question?.difficulty || ""
  );

  const [confidence, setConfidence] = useState(
    question?.confidence || 3
  );

  const [pattern, setPattern] = useState(
    question?.pattern || question?.topic || ""
  );

  const [reflection, setReflection] = useState(
    question?.reflection || ""
  );

  const [mistakes, setMistakes] = useState(
    question?.mistakes || ""
  );

  const [memoryTrigger, setMemoryTrigger] = useState(
    question?.memory_trigger || ""
  );

  const [timeTaken, setTimeTaken] = useState(
    question?.time_taken || ""
  );

  const [questionName, setQuestionName] = useState(
    question?.title || ""
  );

  const [saving, setSaving] = useState(false);
  const { addDemoQuestion, updateDemoQuestion, deleteDemoQuestion } =
    useMemory();

  if (!question) return null;

  const isNew = question.isNew === true;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
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

      // Demo Mode never calls Supabase - Add/Edit is a purely local update
      // to the in-session demo dataset.
      if (isDemoMode()) {
        if (question.id && !question.isNew) {
          updateDemoQuestion(question.id, payload);
        } else {
          addDemoQuestion(payload);
        }

        alert("Question Saved 🚀");

        if (onSave) {
          await onSave();
        }

        onClose();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert("Please login first");
        return;
      }

      let error;

      if (question.id && !question.isNew) {
        const result = await supabase
          .from("problems")
          .update(payload)
          .eq("id", question.id)
          .select();

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

        error = result.error;
      }

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      alert("Question Saved 🚀");

      if (onSave) {
        await onSave();
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!question.id || saving) return;

    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      if (isDemoMode()) {
        deleteDemoQuestion(question.id);
        alert("Question Deleted 🗑️");

        if (onSave) {
          await onSave();
        }

        onClose();
        return;
      }

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

      if (onSave) {
        await onSave();
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

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
                  background: "var(--danger)",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "22px",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
                disabled={saving}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}

            <button
              className="save-btn"
              disabled={saving}
              style={{
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
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
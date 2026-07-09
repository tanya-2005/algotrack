import { supabase } from "../lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { PatternSort } from "../lib/types";
import { useMemory } from "../context/MemoryContext";
import { isDemoMode } from "../lib/demoMode";
import { questionToRow } from "../lib/demoQuestionAdapter";
import "../styles/patterns.css";

function Patterns() {
  const { data: memoryData } = useMemory();
  const demoMode = isDemoMode();
  const demoProblems = useMemo(
    () => memoryData.questions.map(questionToRow),
    [memoryData.questions]
  );
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [loadError, setLoadError] = useState(false);

  const [sort, setSort] =
    useState<PatternSort>("needs-revision");

  const fetchProblems = useCallback(async () => {
    setLoadError(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setLoadError(true);
      setLoading(false);
      return;
    }

    setProblems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (demoMode) return;

    fetchProblems();
  }, [demoMode, fetchProblems]);

  const patterns = useMemo(() => {
    const grouped: any = {};

    (demoMode ? demoProblems : problems).forEach((problem) => {
      const name = problem.topic;

      if (!name) return;

      if (!grouped[name]) {
        grouped[name] = {
          id: name,
          name,
          questions: [],
        };
      }

      grouped[name].questions.push(problem);
    });

    const groups = Object.values(grouped) as any[];

    groups.forEach((pattern) => {
      pattern.avgConfidence =
        pattern.questions.reduce(
          (sum: number, q: any) => sum + (q.confidence || 0),
          0
        ) / pattern.questions.length;
    });

    if (sort === "most-solved") {
      groups.sort((a, b) => b.questions.length - a.questions.length);
    } else if (sort === "highest-confidence") {
      groups.sort((a, b) => b.avgConfidence - a.avgConfidence);
    } else {
      // needs-revision: lowest average confidence first
      groups.sort((a, b) => a.avgConfidence - b.avgConfidence);
    }

    return groups;
  }, [demoMode, demoProblems, problems, sort]);

  if (loading) {
    return (
      <div className="pattern-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pattern-page">
        <h2>Couldn't load your patterns.</h2>
        <p>Check your connection and try again.</p>
        <button
          type="button"
          className="rev-primary-btn"
          onClick={() => {
            setLoading(true);
            fetchProblems();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pattern-page">
      <div className="pattern-header">
        <span className="page-tag">
          DSA MEMORY SYSTEM
        </span>

        <h1>Algorithmic Patterns</h1>

        <p>
          Mental models behind every problem
          you solve.
        </p>
      </div>

      <div className="pattern-sort-bar">
        {(
          [
            ["needs-revision", "Needs Revision"],
            ["most-solved", "Most Solved"],
            [
              "highest-confidence",
              "Highest Confidence",
            ],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={
              sort === key ? "active" : ""
            }
            onClick={() => setSort(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="patterns-grid">
        {patterns.map((pattern: any) => {
          const avgConfidence = pattern.avgConfidence;

          const lastSeen =
            pattern.questions.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];

          let status = "Medium";

          if (avgConfidence >= 4.5)
            status = "Strong";
          else if (avgConfidence <= 2.5)
            status = "Weak";

          return (
            <Link
              key={pattern.id}
              to="/pdetails"
              state={{
                patternName: pattern.name,
              }}
              className="pattern-link"
            >
              <div className="pattern-card">
                <div className="pattern-top">
                  <h2>{pattern.name}</h2>

                  <span
                    className={`pattern-badge ${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                <p className="pattern-desc">
                  Pattern mastered from solved
                  questions.
                </p>

                <div className="pattern-tags">
                  {pattern.questions
                    .slice(0, 3)
                    .map((q: any) => (
                      <span key={q.id}>
                        {q.difficulty}
                      </span>
                    ))}
                </div>

                <div className="pattern-meta">
                  <div>
                    <span>Questions</span>

                    <h3>
                      {
                        pattern.questions
                          .length
                      }
                    </h3>
                  </div>

                  <div>
                    <span>Confidence</span>

                    <h3>
                      {avgConfidence.toFixed(
                        1
                      )}
                      /5
                    </h3>
                  </div>

                  <div className="pattern-retention">
                    <span>Retention</span>

                    <h3>--</h3>
                  </div>
                </div>

                <div className="pattern-last">
                  Last Seen •{" "}
                  {new Date(
                    lastSeen.created_at
                  ).toLocaleDateString()}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Patterns;
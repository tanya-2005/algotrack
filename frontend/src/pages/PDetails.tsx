import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useMemory } from "../context/MemoryContext";
import { isDemoMode } from "../lib/demoMode";
import { questionToRow } from "../lib/demoQuestionAdapter";
import { buildDemoSummary } from "../lib/demoSummary";
import { getRevisionUrgency } from "../lib/memoryEngine";

import PatternHero from "../components/patterns/PatternHero";
import AIInsights from "../components/patterns/AIInsights";
import PatternQuestions from "../components/patterns/PatternQuestions";
import PatternNotes from "../components/patterns/PatternNotes";

import {
  generatePatternSummary,
  getSavedSummary,
  saveSummary,
} from "../services/aiService";

import "../styles/patterns.css";

function PDetails() {
  const location = useLocation();
  const { data: memoryData } = useMemory();
  const demoMode = isDemoMode();

  const patternName =
    (location.state as { patternName?: string } | null)?.patternName || "";

  const demoQuestions = useMemo(
    () =>
      memoryData.questions
        .filter((q) => q.topic === patternName)
        .map(questionToRow),
    [memoryData.questions, patternName]
  );

  const [questions, setQuestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [loading, setLoading] = useState(!demoMode);
  const [loadError, setLoadError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [userId, setUserId] = useState("");

  const loadPage = useCallback(async () => {
    setLoadError(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .eq("topic", patternName);

    if (error) {
      console.error(error);
      setLoadError(true);
      setLoading(false);
      return;
    }

    const qs = data || [];

    setQuestions(qs);

    const saved = await getSavedSummary(patternName, user.id);

    if (saved) {
      setSummary(saved.summary);
    }

    setLoading(false);
  }, [patternName]);

  useEffect(() => {
    if (demoMode) return;

    loadPage();
  }, [demoMode, loadPage]);

  async function handleGenerateSummary() {
  try {
    setGenerating(true);

    if (demoMode) {
      // Demo Mode never calls Supabase (including Edge Functions) - show
      // an instant local example in the same shape the real AI returns.
      setSummary(
        buildDemoSummary(
          patternName,
          memoryData.questions.filter((q) => q.topic === patternName)
        )
      );
      return;
    }

    const summary = await generatePatternSummary(
      patternName,
      questions
    );

    await saveSummary(
      patternName,
      summary,
      userId
    );

    setSummary(summary);
  } catch (err: any) {
    console.error(err);
    const status = err?.context?.status ?? err?.status;
    if (status === 429) {
      alert(
        "The AI service is temporarily rate-limited (OpenRouter free-tier quota reached). Please try again in a few minutes."
      );
    } else {
      alert(
        err?.message
          ? `Couldn't generate the summary: ${err.message}`
          : "Couldn't generate the summary right now. Please try again."
      );
    }
  } finally {
    setGenerating(false);
  }
}

  if (loading) {
    return (
      <h2 style={{ padding: 40 }}>
        Loading...
      </h2>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Couldn't load this pattern.</h2>
        <p>Check your connection and try again.</p>
        <button
          type="button"
          className="rev-primary-btn"
          onClick={() => {
            setLoading(true);
            loadPage();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const displayQuestions = demoMode ? demoQuestions : questions;

  const confidence =
    displayQuestions.length === 0
      ? 0
      : Number(
        (
          displayQuestions.reduce(
            (sum, q) =>
              sum + (q.confidence || 0),
            0
          ) / displayQuestions.length
        ).toFixed(1)
      );

  const lastSolved =
    displayQuestions.length > 0
      ? new Date(
        displayQuestions[0].created_at
      ).toLocaleDateString()
      : "Never";

  const patternMeta = memoryData.patterns.find((p) => p.name === patternName);
  const dueQuestionCount = memoryData.questions.filter(
    (q) => q.topic === patternName && getRevisionUrgency(q) !== "upcoming"
  ).length;

  return (
  <div className="pattern-details-page">
    <PatternHero
      name={patternName}
      confidence={confidence}
      solvedQuestions={displayQuestions.length}
      lastRevised={lastSolved}
      dueQuestions={dueQuestionCount}
      status={patternMeta?.status ?? "Medium"}
      description={patternMeta?.description}
    />

    <PatternQuestions questions={displayQuestions} />

    <PatternNotes summary={summary} />

    <AIInsights
      summary={summary}
      generating={generating}
      onGenerate={handleGenerateSummary}
    />
  </div>
);
}

export default PDetails;
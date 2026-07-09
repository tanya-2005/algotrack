import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useMemory } from "../context/MemoryContext";
import { isDemoMode } from "../lib/demoMode";
import { questionToRow } from "../lib/demoQuestionAdapter";
import { buildDemoSummary } from "../lib/demoSummary";

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

  const [questions, setQuestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (demoMode) {
      setQuestions(
        memoryData.questions
          .filter((q) => q.topic === patternName)
          .map(questionToRow)
      );
      setSummary(null);
      setLoading(false);
      return;
    }

    loadPage();
  }, [demoMode, memoryData.questions, patternName]);

  async function loadPage() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .eq("topic", patternName);

    const qs = data || [];

    setQuestions(qs);

    const saved = await getSavedSummary(patternName, user.id);

    if (saved) {
      setSummary(saved.summary);
    }

    setLoading(false);
  }

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
  } catch (err) {
    console.error(err);
    alert(JSON.stringify(err, null, 2));
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

  const confidence =
    questions.length === 0
      ? 0
      : Number(
        (
          questions.reduce(
            (sum, q) =>
              sum + (q.confidence || 0),
            0
          ) / questions.length
        ).toFixed(1)
      );

  const lastSolved =
    questions.length > 0
      ? new Date(
        questions[0].created_at
      ).toLocaleDateString()
      : "Never";

  return (
  <div className="pattern-details-page">
    <PatternHero
      name={patternName}
      confidence={confidence}
      solvedQuestions={questions.length}
      lastRevised={lastSolved}
      dueQuestions={0}
      status="Medium"
    />

    <PatternQuestions questions={questions} />

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
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

import PatternHero from "../components/patterns/PatternHero";
//import PatternBlueprint from "../components/patterns/PatternBlueprint";
import AIInsights from "../components/patterns/AIInsights";
import PatternQuestions from "../components/patterns/PatternQuestions";
//import CommonMistakes from "../components/patterns/CommonMistakes";
import PatternNotes from "../components/patterns/PatternNotes";
//import RevisionCenter from "../components/patterns/RevisionCenter";

import {
  generatePatternSummary,
  getSavedSummary,
  saveSummary,
} from "../services/aiService";

import "../styles/patterns.css";

function PDetails() {
  const location = useLocation();

  const patternName =
    (location.state as { patternName?: string } | null)?.patternName || "";

  const [questions, setQuestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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
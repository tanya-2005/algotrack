import { supabase } from "../lib/supabase";

export async function getQuestionStats() {
  const { data, error } = await supabase
    .from("problems")
    .select("*");

  if (error) throw error;

  const questions = data || [];

  const totalQuestions = questions.length;

  const totalPatterns = new Set(
    questions.map((q) => q.topic)
  ).size;

  const avgConfidence =
    questions.length > 0
      ? questions.reduce(
          (sum, q) => sum + (q.confidence || 0),
          0
        ) / questions.length
      : 0;

  const retention = Math.round(
    (avgConfidence / 5) * 100
  );

  const dueToday = questions.filter(
    (q) => (q.confidence || 0) <= 2
  ).length;

  return {
    totalQuestions,
    totalPatterns,
    retention,
    dueToday,
  };
}
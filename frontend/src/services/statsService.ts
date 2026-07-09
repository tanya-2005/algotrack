import { supabase } from "../lib/supabase";
import { getRevisionUrgency } from "../lib/memoryEngine";
import { mapRowToQuestion } from "./memoryDataService";

export async function getQuestionStats() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return {
      totalQuestions: 0,
      totalPatterns: 0,
      retention: 0,
      dueToday: 0,
    };
  }

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id);

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

  const dueToday = questions.filter((q) => {
    const urgency = getRevisionUrgency(mapRowToQuestion(q));
    return urgency === "overdue" || urgency === "due-today";
  }).length;

  return {
    totalQuestions,
    totalPatterns,
    retention,
    dueToday,
  };
}
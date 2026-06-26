import { supabase } from "../lib/supabase";

export async function generatePatternSummary(
  pattern: string,
  questions: any[]
) {
  const { data, error } = await supabase.functions.invoke(
    "generate-pattern-summary",
    {
      body: {
        pattern,
        questions,
      },
    }
  );

  if (error) throw error;

  return data;
}

export async function getSavedSummary(
  pattern: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("pattern_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("pattern", pattern)
    .single();

  if (error) return null;

  return data;
}

export async function saveSummary(
  pattern: string,
  summary: any,
  userId: string
) {
  const { error } = await supabase
    .from("pattern_summaries")
    .upsert({
      user_id: userId,
      pattern,
      summary,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}
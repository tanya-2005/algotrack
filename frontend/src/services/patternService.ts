import { supabase } from "../lib/supabase";

export async function getPatternStats() {
  const { data, error } = await supabase
    .from("problems")
    .select("*");

  if (error) throw error;

  return data;
}
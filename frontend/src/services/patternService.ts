import { supabase } from "../lib/supabase";

export async function getPatternStats() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  return data;
}
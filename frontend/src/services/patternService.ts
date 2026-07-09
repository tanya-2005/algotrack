import { supabase } from "../lib/supabase";

export async function getPatternStats() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  return data;
}
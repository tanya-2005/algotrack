import { supabase } from "../lib/supabase";

export const getQuestions = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) throw error;

  return data;
};
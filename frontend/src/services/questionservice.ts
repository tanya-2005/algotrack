import { supabase } from "../lib/supabase";

export const getQuestions = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) throw error;

  return data;
};
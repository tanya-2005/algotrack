import { supabase } from "../lib/supabase";

export const getQuestions = async () => {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;

  return data;
};
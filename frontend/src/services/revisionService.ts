import { supabase } from "../lib/supabase";
import { advanceStar, computeNextRevisionDate, regressStar } from "../lib/memoryEngine";

// Persists a Leitner-style spaced-repetition outcome for a single question:
// advances or regresses its revision_star and recomputes next_revision_at
// from the matching interval. Demo Mode never calls this (see
// MemoryContext.tsx - it only updates local state there).
export async function recordRevisionOutcome(
  questionId: string,
  currentStar: number,
  recalled: boolean
): Promise<{ star: number; nextRevisionAt: string }> {
  const star = recalled ? advanceStar(currentStar) : regressStar(currentStar);
  const now = new Date();
  const nextRevisionAt = computeNextRevisionDate(star, now);

  const { error } = await supabase
    .from("problems")
    .update({
      revision_star: star,
      last_revised_at: now.toISOString(),
      next_revision_at: nextRevisionAt,
    })
    .eq("id", questionId);

  if (error) throw error;

  return { star, nextRevisionAt };
}

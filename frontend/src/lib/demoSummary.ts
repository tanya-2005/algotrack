import type { Question } from "./types";

// Demo Mode never calls Supabase (including Edge Functions), so "Generate
// AI Summary" shows an instant, locally-built example instead - same
// shape as the real generate-pattern-summary Edge Function's output, so
// AIInsights/PatternNotes render it identically either way.
export function buildDemoSummary(patternName: string, questions: Question[]) {
  const weakest = [...questions].sort((a, b) => a.confidence - b.confidence)[0];
  const strongest = [...questions].sort((a, b) => b.confidence - a.confidence)[0];

  return {
    overview: `${patternName} problems share a repeatable recognition signal and a small set of implementation pitfalls. Once you spot the trigger, the approach is usually mechanical. Most of the difficulty is in the edge cases, not the core idea.`,
    recognition: `Look for phrasing that hints at ${patternName.toLowerCase()} directly. The constraints usually rule out brute force. Related patterns often show up as distractors in the same problem set.`,
    mistakes: `Rushing to code before defining the state or invariant clearly. Missing an edge case at the boundaries (empty input, single element). Not testing the shrink/backtrack step, only the expand/forward step.`,
    optimization: `Precompute anything reused across iterations instead of recomputing it. Track the right auxiliary state so each step is O(1) amortized. Trade a bit of extra memory for a much simpler loop condition.`,
    interview: `Say the pattern name and why it fits out loud before coding - it signals recognition speed to the interviewer.`,
    revisionTip: `Re-derive the trigger condition from scratch instead of re-reading your old solution; that's what actually tests recall.`,
    memorySummary: {
      progress: `Across ${questions.length} logged question${questions.length === 1 ? "" : "s"} in ${patternName}, confidence ranges from ${weakest?.confidence ?? "-"} to ${strongest?.confidence ?? "-"} out of 5. ${weakest ? `"${weakest.name}" is the shakiest recall right now.` : ""} ${strongest ? `"${strongest.name}" shows the strongest grasp of the pattern.` : ""} This is example output from Demo Mode - sign in and log your own questions to get a summary grounded in your real reflections.`,
      nextFocus: [
        `Re-attempt "${weakest?.name ?? "your weakest question"}" without looking at your old notes.`,
        `Write one reflection sentence immediately after solving your next ${patternName} problem.`,
        `Explain the recognition trigger out loud before writing any code.`,
        `Review the mistakes list above before starting a new ${patternName} problem.`,
      ],
    },
  };
}

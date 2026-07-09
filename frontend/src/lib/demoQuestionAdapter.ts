import type { Question } from "./types";

// Demo Mode's canonical data lives as Question[] (shared with
// Dashboard/Revision). Questions/Patterns/PDetails, however, are built
// around the raw Supabase "problems" row shape. This adapter lets those
// pages render demo data through their existing (unchanged) rendering
// logic instead of duplicating it for a second shape.
function minutesToBucket(minutes?: number): string {
  if (minutes == null) return "";
  if (minutes < 15) return "Under 15 min";
  if (minutes <= 30) return "15-30 min";
  if (minutes <= 60) return "30-60 min";
  return "60+ min";
}

function bucketToMinutes(bucket?: string): number | undefined {
  switch (bucket) {
    case "Under 15 min":
      return 12;
    case "15-30 min":
      return 22;
    case "30-60 min":
      return 45;
    case "60+ min":
      return 75;
    case "Needed Solution":
      return 90;
    default:
      return undefined;
  }
}

function normalizeDifficulty(raw: string): "easy" | "medium" | "hard" {
  const d = (raw || "").toLowerCase();
  return d === "easy" || d === "hard" ? d : "medium";
}

export function questionToRow(q: Question) {
  return {
    id: q.id,
    title: q.name,
    topic: q.topic,
    difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1),
    confidence: q.confidence,
    reflection: q.reflection,
    mistakes: q.mistakes.join("\n"),
    memory_trigger: q.trigger,
    time_taken: minutesToBucket(q.timeTaken),
    created_at: q.solvedAt,
    user_id: "demo",
  };
}

export type QuestionFormPayload = {
  title: string;
  difficulty: string;
  topic: string;
  confidence: number;
  reflection: string;
  mistakes: string;
  memory_trigger: string;
  time_taken: string;
};

// Inverse of questionToRow, for ReflectionPanel's Add/Edit form payload
// (same field names as a Supabase row) in Demo Mode. Pass the existing
// Question when editing so its id/solvedAt/star/etc. are preserved.
export function formPayloadToQuestion(
  payload: QuestionFormPayload,
  existing?: Question
): Question {
  const mistakes = payload.mistakes
    ? payload.mistakes.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: existing?.id ?? `demo-${Date.now()}`,
    name: payload.title || "Untitled Question",
    topic: payload.topic || "General",
    difficulty: normalizeDifficulty(payload.difficulty),
    pattern: payload.topic || "General",
    trigger: payload.memory_trigger,
    confidence: payload.confidence,
    reflection: payload.reflection,
    mistakes,
    insights: payload.reflection ? [payload.reflection] : existing?.insights ?? [],
    solvedAt: existing?.solvedAt ?? new Date().toISOString(),
    lastRevisedAt: existing?.lastRevisedAt,
    timeTaken: bucketToMinutes(payload.time_taken),
    revisionStar: existing?.revisionStar ?? 1,
    nextRevisionAt: existing?.nextRevisionAt,
  };
}

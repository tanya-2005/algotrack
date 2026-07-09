import { supabase } from "../lib/supabase";
import type { Question, PatternData } from "../lib/types";

function normalizeDifficulty(raw: string | null): "easy" | "medium" | "hard" {
  const d = (raw || "").toLowerCase();
  if (d === "easy" || d === "medium" || d === "hard") return d;
  return "medium";
}

// The DB stores time-taken as a free-text bucket picked from ReflectionPanel's
// select (see components/questions/ReflectionPanel.tsx). Map it back to a
// representative minute value so memoryEngine's numeric calculations work.
function estimateMinutes(raw: string | null): number | undefined {
  switch (raw) {
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

function splitLines(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapRowToQuestion(row: any): Question {
  return {
    id: String(row.id),
    name: row.title || "Untitled Question",
    topic: row.topic || "General",
    difficulty: normalizeDifficulty(row.difficulty),
    pattern: row.topic || "General",
    trigger: row.memory_trigger || "",
    confidence: row.confidence ?? 3,
    reflection: row.reflection || "",
    mistakes: splitLines(row.mistakes),
    // The DB has no dedicated "insights" column; the reflection is the
    // closest real analogue ("what clicked / what to remember").
    insights: row.reflection ? [row.reflection] : [],
    solvedAt: row.created_at,
    lastRevisedAt: row.last_revised_at ?? undefined,
    timeTaken: estimateMinutes(row.time_taken),
    revisionStar: row.revision_star ?? 1,
    nextRevisionAt: row.next_revision_at ?? undefined,
  };
}

function derivePatterns(questions: Question[]): PatternData[] {
  const groups = new Map<string, Question[]>();
  questions.forEach((q) => {
    const list = groups.get(q.topic) ?? [];
    list.push(q);
    groups.set(q.topic, list);
  });

  return Array.from(groups.entries()).map(([name, qs]) => {
    const avg = qs.reduce((s, q) => s + q.confidence, 0) / qs.length;
    const status: PatternData["status"] =
      avg >= 4.5 ? "Strong" : avg <= 2.5 ? "Weak" : "Medium";
    return {
      id: name,
      name,
      description: `${qs.length} solved question${qs.length === 1 ? "" : "s"} in this pattern.`,
      tags: [],
      status,
    };
  });
}

export async function fetchRealMemoryData(): Promise<{
  questions: Question[];
  patterns: PatternData[];
} | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return null;

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const questions = (data || []).map(mapRowToQuestion);
  const patterns = derivePatterns(questions);

  return { questions, patterns };
}

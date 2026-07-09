import type {
  Activity,
  AppData,
  MemoryRiskLevel,
  PatternData,
  PatternSort,
  PredictionHorizon,
  Question,
  QuestionStatus,
  RevisionHistoryEntry,
  RevisionQueueItem,
} from "./types";

const MS_DAY = 86400000;

export function daysSince(iso?: string): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / MS_DAY);
}

export function formatRelative(iso?: string): string {
  const days = daysSince(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// Calendar-day-aware phrasing for a future/near revision due date (as
// opposed to formatRelative, which is for past events like solvedAt).
// Buckets by calendar day rather than elapsed hours, so "due today" reads
// correctly regardless of what time of day it currently is.
export function formatDueDate(iso?: string, now: Date = new Date()): string {
  if (!iso) return "now";
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const dueStart = new Date(iso);
  dueStart.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueStart.getTime() - todayStart.getTime()) / MS_DAY
  );

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "1 day overdue";
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  return `in ${diffDays} days`;
}

export function getQuestionStatus(q: Question): QuestionStatus {
  const sinceRevision = daysSince(q.lastRevisedAt ?? q.solvedAt);
  if (q.confidence >= 4 && sinceRevision <= 14) return "mastered";
  if (sinceRevision >= 30 || q.confidence <= 2) return "forgotten";
  if (sinceRevision >= 7 || q.confidence <= 3) return "needs-revision";
  return "learning";
}

export function computeRetention(q: Question): number {
  const base = (q.confidence / 5) * 100;
  const decay = daysSince(q.lastRevisedAt ?? q.solvedAt) * 2.5;
  return Math.max(5, Math.round(base - decay));
}

export function predictRetention(
  q: Question,
  horizon: PredictionHorizon
): number {
  const current = computeRetention(q);
  const decayRate = horizon === 3 ? 0.12 : horizon === 7 ? 0.28 : 0.45;
  return Math.max(0, Math.round(current * (1 - decayRate)));
}

export function getPatternStats(data: AppData, pattern: PatternData) {
  const related = data.questions.filter((q) => q.pattern === pattern.name);
  const count = related.length;
  const avgConfidence =
    count > 0
      ? related.reduce((s, q) => s + q.confidence, 0) / count
      : 0;
  const retentions = related.map(computeRetention);
  const retention =
    retentions.length > 0
      ? Math.round(retentions.reduce((a, b) => a + b, 0) / retentions.length)
      : 0;
  const lastSeen = related.reduce<string | undefined>((latest, q) => {
    const d = q.lastRevisedAt ?? q.solvedAt;
    return !latest || d > latest ? d : latest;
  }, undefined);
  const needsRevision = related.filter(
    (q) => getQuestionStatus(q) !== "mastered"
  ).length;
  return {
    count,
    avgConfidence,
    retention,
    lastSeen,
    needsRevision,
    confidenceLabel: `${avgConfidence.toFixed(1)} / 5`,
  };
}

export function sortPatterns(
  data: AppData,
  sort: PatternSort
): PatternData[] {
  const patterns = [...data.patterns];
  return patterns.sort((a, b) => {
    const sa = getPatternStats(data, a);
    const sb = getPatternStats(data, b);
    if (sort === "needs-revision") return sb.needsRevision - sa.needsRevision;
    if (sort === "most-solved") return sb.count - sa.count;
    return sb.avgConfidence - sa.avgConfidence;
  });
}

export function getMostActiveTime(questions: Question[]): string {
  const buckets = new Array(24).fill(0);
  questions.forEach((q) => {
    const h = new Date(q.solvedAt).getHours();
    buckets[h]++;
  });
  let best = 21;
  for (let i = 0; i < 24; i++) {
    const window =
      buckets[i] + buckets[(i + 1) % 24] + buckets[(i + 2) % 24];
    const bestWindow =
      buckets[best] +
      buckets[(best + 1) % 24] +
      buckets[(best + 2) % 24];
    if (window > bestWindow) best = i;
  }
  const fmt = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour} ${period}`;
  };
  return `${fmt(best)} - ${fmt((best + 2) % 24)}`;
}

export function getAverageRevisionGap(questions: Question[]): string {
  const gaps = questions
    .filter((q) => q.lastRevisedAt)
    .map((q) => daysSince(q.solvedAt) - daysSince(q.lastRevisedAt));
  if (gaps.length === 0) return "—";
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  return `${avg.toFixed(1)} Days`;
}

export function getFavoritePattern(questions: Question[]): string {
  const counts: Record<string, number> = {};
  questions.forEach((q) => {
    counts[q.pattern] = (counts[q.pattern] ?? 0) + 1;
  });
  return (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
  );
}

export function getStrongestTopic(questions: Question[]): string {
  const topics: Record<string, { sum: number; n: number }> = {};
  questions.forEach((q) => {
    if (!topics[q.topic]) topics[q.topic] = { sum: 0, n: 0 };
    topics[q.topic].sum += q.confidence;
    topics[q.topic].n++;
  });
  return (
    Object.entries(topics)
      .map(([topic, { sum, n }]) => ({ topic, avg: sum / n }))
      .sort((a, b) => b.avg - a.avg)[0]?.topic ?? "—"
  );
}

export function getForgottenConcepts(data: AppData): string[] {
  const forgotten = data.questions
    .filter((q) => getQuestionStatus(q) === "forgotten")
    .map((q) => q.pattern);
  return [...new Set(forgotten)];
}

export function getMemoryRiskLevel(data: AppData): MemoryRiskLevel {
  const forgotten = getForgottenConcepts(data).length;
  const due = data.questions.filter(
    (q) => getQuestionStatus(q) === "needs-revision"
  ).length;
  if (forgotten >= 3 || due >= 5) return "High";
  if (forgotten >= 1 || due >= 3) return "Medium";
  return "Low";
}

export function getRecommendedRevision(data: AppData) {
  const due = data.questions
    .filter((q) => getQuestionStatus(q) !== "mastered")
    .sort(
      (a, b) =>
        computeRetention(a) - computeRetention(b) ||
        daysSince(b.lastRevisedAt ?? b.solvedAt) -
          daysSince(a.lastRevisedAt ?? a.solvedAt)
    )[0];
  if (!due) return { pattern: "Sliding Window", duration: "5 min", id: "" };
  const mins = Math.max(3, Math.round((due.timeTaken ?? 30) / 6));
  return {
    pattern: due.pattern,
    question: due.name,
    duration: `${mins} min`,
    id: due.id,
  };
}

export function getMemoryScore(data: AppData): number {
  if (data.questions.length === 0) return 0;
  const avg =
    data.questions.reduce((s, q) => s + computeRetention(q), 0) /
    data.questions.length;
  return Math.round(avg);
}

export function getRevisionDueCount(data: AppData): number {
  return data.revisionQueue.filter((i) => !i.completed && !i.skipped).length;
}

export function getEstimatedRevisionTime(queue: RevisionQueueItem[]): string {
  const active = queue.filter((i) => !i.completed && !i.skipped);
  const mins = active.length * 3;
  return `${mins} min`;
}

export function groupActivitiesByDate(
  activities: Activity[]
): { label: string; items: Activity[] }[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const groups: Record<string, Activity[]> = {};
  sorted.forEach((a) => {
    const label = formatRelative(a.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(a);
  });
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function getMemorySummaryFromReflections(
  questions: Question[],
  patternName: string
) {
  const related = questions.filter((q) => q.pattern === patternName);
  const forgetLines = related.flatMap((q) => q.mistakes).slice(0, 4);
  const focusLines = related
    .flatMap((q) => q.insights)
    .slice(0, 2);
  const reflections = related
    .map((q) => q.reflection)
    .filter(Boolean)
    .slice(0, 2);
  return { forgetLines, focusLines, reflections };
}

export function getRevisionHistory(
  questions: Question[],
  patternName: string
): RevisionHistoryEntry[] {
  const related = questions
    .filter((q) => q.pattern === patternName)
    .flatMap((q) => {
      const entries: RevisionHistoryEntry[] = [];
      if (q.lastRevisedAt) {
        entries.push({
          id: `${q.id}-rev`,
          date: q.lastRevisedAt,
          status: getQuestionStatus(q) === "forgotten" ? "forgotten" : "revised",
          label: q.name,
        });
      }
      return entries;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  return related;
}

export function getWeakestPattern(data: AppData): string {
  const scored = data.patterns.map((p) => ({
    name: p.name,
    ...getPatternStats(data, p),
  }));
  scored.sort((a, b) => a.retention - b.retention);
  return scored[0]?.name ?? "—";
}

export function getStrongestPattern(data: AppData): string {
  const scored = data.patterns.map((p) => ({
    name: p.name,
    ...getPatternStats(data, p),
  }));
  scored.sort((a, b) => b.retention - a.retention);
  return scored[0]?.name ?? "—";
}

export function getAverageConfidence(data: AppData): string {
  if (data.questions.length === 0) return "0%";
  const avg =
    (data.questions.reduce((s, q) => s + q.confidence, 0) /
      data.questions.length /
      5) *
    100;
  return `${Math.round(avg)}%`;
}

export function getAverageSolveTime(data: AppData): string {
  const times = data.questions
    .map((q) => q.timeTaken)
    .filter((t): t is number => t != null);
  if (times.length === 0) return "—";
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return `${Math.round(avg)} mins`;
}

export function getImprovingPatterns(data: AppData): string[] {
  return data.patterns
    .filter((p) => {
      const stats = getPatternStats(data, p);
      return stats.retention >= 70 && stats.avgConfidence >= 3.5;
    })
    .map((p) => p.name)
    .slice(0, 3);
}

// Leitner-style spaced repetition: each star (1-5) maps to a fixed review
// interval. Successful recall advances the star (max 5); a forgotten
// review regresses it (min 1). See supabase/migrations for the matching
// revision_star/last_revised_at/next_revision_at columns.
export const STAR_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 15,
  5: 30,
};

export function getStarInterval(star: number): number {
  const clamped = Math.min(Math.max(Math.round(star || 1), 1), 5);
  return STAR_INTERVAL_DAYS[clamped];
}

export function computeNextRevisionDate(
  star: number,
  from: Date = new Date()
): string {
  const days = getStarInterval(star);
  return new Date(from.getTime() + days * MS_DAY).toISOString();
}

export function advanceStar(star?: number): number {
  return Math.min((star ?? 1) + 1, 5);
}

export function regressStar(star?: number): number {
  return Math.max((star ?? 1) - 1, 1);
}

export type RevisionUrgency = "overdue" | "due-today" | "upcoming";

export function getRevisionUrgency(
  question: Question,
  now: Date = new Date()
): RevisionUrgency {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + MS_DAY);

  // No scheduling data yet (e.g. Demo Mode fallback) - treat as due now.
  if (!question.nextRevisionAt) return "due-today";

  const due = new Date(question.nextRevisionAt);
  if (due < todayStart) return "overdue";
  if (due < todayEnd) return "due-today";
  return "upcoming";
}

export function getOverdueQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => getRevisionUrgency(q) === "overdue");
}

export function getDueTodayQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => getRevisionUrgency(q) === "due-today");
}

export function getUpcomingQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => getRevisionUrgency(q) === "upcoming");
}

// Recomputes pattern status/counts from the current question set after a
// Demo Mode add/edit/delete, while preserving each existing pattern's
// curated description/tags (matched by name) so those don't regress to a
// generic auto-description. A brand-new topic (e.g. picked from
// ReflectionPanel's fixed pattern list) gets a generic entry.
export function deriveDemoPatterns(
  questions: Question[],
  existingPatterns: PatternData[]
): PatternData[] {
  const byName = new Map(existingPatterns.map((p) => [p.name, p]));
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
    const existing = byName.get(name);
    return {
      id: existing?.id ?? name,
      name,
      description:
        existing?.description ??
        `${qs.length} solved question${qs.length === 1 ? "" : "s"} in this pattern.`,
      tags: existing?.tags ?? [],
      status,
    };
  });
}

export function buildRevisionQueueFromData(
  questions: Question[],
  patterns: PatternData[]
): RevisionQueueItem[] {
  const urgencyRank: Record<RevisionUrgency, number> = {
    overdue: 0,
    "due-today": 1,
    upcoming: 2,
  };

  const dueQuestions = questions
    .filter((q) => getRevisionUrgency(q) !== "upcoming")
    .sort((a, b) => {
      const rankDiff =
        urgencyRank[getRevisionUrgency(a)] - urgencyRank[getRevisionUrgency(b)];
      if (rankDiff !== 0) return rankDiff;
      const aTime = a.nextRevisionAt ? new Date(a.nextRevisionAt).getTime() : 0;
      const bTime = b.nextRevisionAt ? new Date(b.nextRevisionAt).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, 5)
    .map((q) => ({
      id: `rq-q-${q.id}`,
      type: "question" as const,
      title: q.name,
      completed: false,
      skipped: false,
      reviewAgain: false,
      questionId: q.id,
      star: q.revisionStar ?? 1,
      nextRevisionAt: q.nextRevisionAt,
    }));

  const duePatterns = patterns
    .filter((p) => p.status !== "Strong")
    .slice(0, 3)
    .map((p) => ({
      id: `rq-p-${p.name}`,
      type: "pattern" as const,
      title: `${p.name} Pattern`,
      completed: false,
      skipped: false,
      reviewAgain: false,
    }));

  return [...dueQuestions, ...duePatterns];
}

const HEATMAP_WEEKS = 18;
const HEATMAP_DAYS = 5;

export function getHeatmapData(questions: Question[]) {
  const totalCells = HEATMAP_WEEKS * HEATMAP_DAYS;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = new Array(totalCells).fill(0);
  const weekdayTotals = new Array(7).fill(0);

  questions.forEach((q) => {
    if (!q.solvedAt) return;
    const solved = new Date(q.solvedAt);
    solved.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - solved.getTime()) / MS_DAY
    );
    if (diffDays >= 0 && diffDays < totalCells) {
      counts[diffDays]++;
    }
    if (diffDays >= 0 && diffDays < 90) {
      weekdayTotals[solved.getDay()]++;
    }
  });

  const toLevel = (count: number) =>
    count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;

  // weekIndex 0 = oldest (leftmost), highest weekIndex = most recent.
  const weeks: number[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const col: number[] = [];
    for (let d = 0; d < HEATMAP_DAYS; d++) {
      const idx = (HEATMAP_WEEKS - 1 - w) * HEATMAP_DAYS + d;
      col.push(toLevel(counts[idx] ?? 0));
    }
    weeks.push(col);
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const bestDayIndex = weekdayTotals.reduce(
    (best, val, i, arr) => (val > arr[best] ? i : best),
    0
  );
  const bestDay = questions.length > 0 ? dayNames[bestDayIndex] : "—";

  let currentStreak = 0;
  for (let i = 0; i < totalCells; i++) {
    if (counts[i] > 0) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let running = 0;
  for (let i = totalCells - 1; i >= 0; i--) {
    if (counts[i] > 0) {
      running++;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  return {
    weeks,
    bestDay,
    questionsLogged: questions.length,
    revisionsCompleted: questions.filter((q) => q.lastRevisedAt).length,
    longestStreak,
    currentStreak,
  };
}

export function getMemoryScoreTrendData(
  questions: Question[]
): { month: string; score: number }[] {
  if (questions.length === 0) return [];

  const monthMap = new Map<string, { sum: number; n: number; order: number }>();
  questions.forEach((q) => {
    if (!q.solvedAt) return;
    const d = new Date(q.solvedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const order = d.getFullYear() * 12 + d.getMonth();
    const entry = monthMap.get(key) ?? { sum: 0, n: 0, order };
    entry.sum += q.confidence;
    entry.n += 1;
    monthMap.set(key, entry);
  });

  return Array.from(monthMap.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .slice(-6)
    .map(([key, { sum, n }]) => {
      const monthIdx = Number(key.split("-")[1]);
      const label = new Date(2000, monthIdx, 1).toLocaleString("en-US", {
        month: "short",
      });
      return { month: label, score: Math.round((sum / n / 5) * 100) };
    });
}

export function getRevisionForecast(data: AppData): {
  today: number;
  tomorrow: number;
  thisWeek: number;
} {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const dueWithin = (days: number) =>
    data.questions.filter((q) => {
      if (!q.nextRevisionAt) return true;
      const due = new Date(q.nextRevisionAt).getTime();
      return due < startOfToday.getTime() + days * MS_DAY;
    }).length;

  return {
    today: dueWithin(1),
    tomorrow: dueWithin(2),
    thisWeek: dueWithin(7),
  };
}

export function getRevisionRecommendationItems(data: AppData): {
  pattern: string;
  days: number;
  confidence: number;
  priority: "high" | "medium" | "low";
}[] {
  return data.patterns
    .map((p) => {
      const stats = getPatternStats(data, p);
      return {
        pattern: p.name,
        days: daysSince(stats.lastSeen),
        confidence: Math.round((stats.avgConfidence / 5) * 100),
        priority: (stats.retention < 40
          ? "high"
          : stats.retention < 70
            ? "medium"
            : "low") as "high" | "medium" | "low",
      };
    })
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 3);
}

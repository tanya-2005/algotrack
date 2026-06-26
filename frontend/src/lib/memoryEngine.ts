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

export function shouldShowQuickRecall(): boolean {
  const key = "dsa-quick-recall-last";
  const last = localStorage.getItem(key);
  const now = Date.now();
  if (!last || now - Number(last) > 3600000) {
    localStorage.setItem(key, String(now));
    return Math.random() > 0.4;
  }
  return false;
}

export function getQuickRecallQuestion(data: AppData): Question | null {
  const candidates = data.questions.filter(
    (q) => daysSince(q.lastRevisedAt ?? q.solvedAt) >= 5
  );
  if (candidates.length === 0) return data.questions[0] ?? null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

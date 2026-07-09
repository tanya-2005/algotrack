export type ThemeMode = "dark" | "light";

export type QuestionStatus =
  | "mastered"
  | "needs-revision"
  | "forgotten"
  | "learning";

export type ActivityType =
  | "solved"
  | "revised"
  | "mistake"
  | "reflection"
  | "ai"
  | "quiz-score"
  | "pattern-mastered"
  | "revision-completed";

export type QuizType =
  | "pattern-recognition"
  | "reflection-recall"
  | "mistake-recovery"
  | "concept-recall"
  | "random-memory"
  | "mixed-battle";

export interface Question {
  id: string;
  name: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  pattern: string;
  trigger: string;
  confidence: number;
  reflection: string;
  mistakes: string[];
  insights: string[];
  solvedAt: string;
  lastRevisedAt?: string;
  timeTaken?: number;
  // Leitner-style spaced repetition: 1-5, mapped to fixed review intervals
  // (1/3/7/15/30 days). Increases on successful recall, decreases on a
  // forgotten review. Falls back to 1/undefined for rows predating this
  // system (e.g. Demo Mode seed data can omit these).
  revisionStar?: number;
  nextRevisionAt?: string;
}

export interface PatternData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "Strong" | "Medium" | "Weak";
}

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  highlight: string;
  date: string;
}

export interface RevisionQueueItem {
  id: string;
  type: "question" | "pattern" | "reflection";
  title: string;
  completed: boolean;
  skipped: boolean;
  reviewAgain: boolean;
  // Only set for type "question" items, sourced from the underlying
  // question's revisionStar/nextRevisionAt.
  questionId?: string;
  star?: number;
  nextRevisionAt?: string;
}

export interface QuizResult {
  id: string;
  date: string;
  score: number;
  total: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  context?: string;
  options: QuizOption[];
  correctId: string;
  sourceQuestionId?: string;
}

export interface RevisionHistoryEntry {
  id: string;
  date: string;
  status: "revised" | "forgotten";
  label: string;
}

export interface AppData {
  questions: Question[];
  patterns: PatternData[];
  activities: Activity[];
  revisionQueue: RevisionQueueItem[];
  quizResults: QuizResult[];
  dailyChallengeIndex: number;
  dailyChallengeDate: string;
}

export type MemoryRiskLevel = "High" | "Medium" | "Low";

export type PatternSort = "needs-revision" | "most-solved" | "highest-confidence";

export type PredictionHorizon = 3 | 7 | 14;

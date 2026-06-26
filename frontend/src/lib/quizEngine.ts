import type { AppData, QuizQuestion, QuizType } from "./types";
import { daysSince } from "./memoryEngine";

const patternOptions = [
  "Sliding Window",
  "Dynamic Programming",
  "Prefix Sum",
  "Graph",
  "BFS",
  "Two Pointer",
  "Binary Search",
  "Trie",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeOptions(correct: string, pool: string[]) {
  const distractors = shuffle(
    pool.filter((p) => p !== correct)
  ).slice(0, 3);
  const all = shuffle([correct, ...distractors]);
  return all.map((text, i) => ({
    id: String.fromCharCode(65 + i),
    text,
  }));
}

function findCorrectId(options: { id: string; text: string }[], correct: string) {
  return options.find((o) => o.text === correct)?.id ?? "A";
}

export function generateDailyQuiz(data: AppData): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  let id = 0;

  const patternQs = data.questions.filter((q) => q.pattern);
  const withReflections = data.questions.filter((q) => q.reflection);
  const withMistakes = data.questions.filter((q) => q.mistakes.length > 0);
  const oldSolved = data.questions.filter(
    (q) => daysSince(q.solvedAt) >= 14
  );

  const add = (q: Omit<QuizQuestion, "id">) => {
    questions.push({ ...q, id: `quiz-${id++}` });
  };

  // Pattern Recognition (5)
  shuffle(patternQs)
    .slice(0, 5)
    .forEach((q) => {
      const options = makeOptions(q.pattern, patternOptions);
      add({
        type: "pattern-recognition",
        prompt: `Find the pattern for: "${q.name}"`,
        context: q.trigger,
        options,
        correctId: findCorrectId(options, q.pattern),
        sourceQuestionId: q.id,
      });
    });

  // Reflection Recall (4)
  shuffle(withReflections)
    .slice(0, 4)
    .forEach((q) => {
      const options = makeOptions(
        q.insights[0] ?? "Shrink window when invalid",
        [
          "Use brute force first",
          "Always expand right pointer",
          "Skip memoization",
          "Use DFS for all graphs",
          q.mistakes[0] ?? "Wrong approach",
        ]
      );
      add({
        type: "reflection-recall",
        prompt: `You wrote: "${q.reflection}" — What is the key insight?`,
        options,
        correctId: findCorrectId(
          options,
          q.insights[0] ?? "Shrink window when invalid"
        ),
        sourceQuestionId: q.id,
      });
    });

  // Mistake Recovery (3)
  shuffle(withMistakes)
    .slice(0, 3)
    .forEach((q) => {
      const mistake = q.mistakes[0];
      const fix = q.insights[0] ?? "Review the correct approach first";
      const options = makeOptions(fix, [
        "Ignore the mistake",
        "Start coding immediately",
        mistake,
        "Skip edge cases",
      ]);
      add({
        type: "mistake-recovery",
        prompt: `You previously made: "${mistake}" — What should happen first?`,
        options,
        correctId: findCorrectId(options, fix),
        sourceQuestionId: q.id,
      });
    });

  // Concept Recall (2)
  shuffle(data.questions.filter((q) => q.trigger))
    .slice(0, 2)
    .forEach((q) => {
      const options = makeOptions(q.trigger, [
        "Use nested loops",
        "Sort descending first",
        "Greedy always works",
        "No state needed",
      ]);
      add({
        type: "concept-recall",
        prompt: `What is the key state/trigger in "${q.name}"?`,
        options,
        correctId: findCorrectId(options, q.trigger),
        sourceQuestionId: q.id,
      });
    });

  // Random Memory Check (2)
  shuffle(oldSolved)
    .slice(0, 2)
    .forEach((q) => {
      const options = makeOptions(q.pattern, patternOptions);
      add({
        type: "random-memory",
        prompt: `You solved "${q.name}" ${daysSince(q.solvedAt)} days ago. What pattern was used?`,
        options,
        correctId: findCorrectId(options, q.pattern),
        sourceQuestionId: q.id,
      });
    });

  return shuffle(questions).slice(0, 15);
}

export function generateReflectionQuiz(data: AppData): QuizQuestion | null {
  const candidates = data.questions.filter(
    (q) => q.reflection && q.insights.length > 0
  );
  if (candidates.length === 0) return null;
  const q = candidates[Math.floor(Math.random() * candidates.length)];
  const correct =
    q.insights[0] ?? "Remove characters before advancing left pointer";
  const options = makeOptions(correct, [
    "Always move both pointers",
    "Use recursion instead",
    q.mistakes[0] ?? "Expand window only",
    "Skip duplicate handling",
  ]);
  return {
    id: "flashback-1",
    type: "reflection-recall",
    prompt: `What exactly should trigger the action described in your reflection?`,
    context: `${formatDaysAgo(q)} you wrote: "${q.reflection}"`,
    options,
    correctId: findCorrectId(options, correct),
    sourceQuestionId: q.id,
  };
}

function formatDaysAgo(q: { lastRevisedAt?: string; solvedAt: string }) {
  const d = daysSince(q.lastRevisedAt ?? q.solvedAt);
  return d === 0 ? "Today" : `${d} days ago`;
}

export function generatePatternChallenge(data: AppData): {
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
} {
  const challenges = [
    {
      question:
        "Find the longest contiguous subarray whose sum is less than or equal to K.",
      correct: "Sliding Window",
    },
    {
      question:
        "Find longest subarray with at most K distinct characters.",
      correct: "Sliding Window",
    },
    {
      question: "Detect cycle in directed graph.",
      correct: "Graph",
    },
    {
      question: "Maximum sum non-adjacent elements in array.",
      correct: "Dynamic Programming",
    },
  ];
  const c =
    challenges[data.dailyChallengeIndex % challenges.length] ??
    challenges[0];
  const options = makeOptions(c.correct, patternOptions);
  return {
    question: c.question,
    options,
    correctId: findCorrectId(options, c.correct),
  };
}

export const quizTypeLabels: Record<QuizType, string> = {
  "pattern-recognition": "Pattern Recognition",
  "reflection-recall": "Reflection Recall",
  "mistake-recovery": "Mistake Recovery",
  "concept-recall": "Concept Recall",
  "random-memory": "Random Memory Check",
  "mixed-battle": "Mixed Battle",
};

export function getQuizModeCounts(quiz: QuizQuestion[]) {
  const counts: Partial<Record<QuizType, number>> = {};
  quiz.forEach((q) => {
    counts[q.type] = (counts[q.type] ?? 0) + 1;
  });
  return counts;
}

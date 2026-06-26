import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, QuizResult, RevisionQueueItem } from "../lib/types";
import { defaultAppData } from "../lib/seedData";
import { getMemoryScore } from "../lib/memoryEngine";

const STORAGE_KEY = "dsa-memory-data";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultAppData, ...JSON.parse(raw) };
  } catch {
    /* use defaults */
  }
  return defaultAppData;
}

function persist(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type MemoryContextValue = {
  data: AppData;
  updateQueueItem: (
    id: string,
    patch: Partial<RevisionQueueItem>
  ) => void;
  completeQueueItem: (id: string) => void;
  skipQueueItem: (id: string) => void;
  reviewAgainQueueItem: (id: string) => void;
  addQuizResult: (result: Omit<QuizResult, "id">) => void;
  advanceDailyChallenge: () => void;
  markQuestionRevised: (questionId: string) => void;
  memoryScore: number;
};

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  const save = useCallback((next: AppData) => {
    setData(next);
    persist(next);
  }, []);

  const updateQueueItem = useCallback(
    (id: string, patch: Partial<RevisionQueueItem>) => {
      setData((prev) => {
        const next = {
          ...prev,
          revisionQueue: prev.revisionQueue.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        };
        persist(next);
        return next;
      });
    },
    []
  );

  const completeQueueItem = useCallback(
    (id: string) => updateQueueItem(id, { completed: true }),
    [updateQueueItem]
  );

  const skipQueueItem = useCallback(
    (id: string) => updateQueueItem(id, { skipped: true }),
    [updateQueueItem]
  );

  const reviewAgainQueueItem = useCallback(
    (id: string) =>
      updateQueueItem(id, { reviewAgain: true, completed: false }),
    [updateQueueItem]
  );

  const addQuizResult = useCallback(
    (result: Omit<QuizResult, "id">) => {
      setData((prev) => {
        const next = {
          ...prev,
          quizResults: [
            {
              ...result,
              id: `qr-${Date.now()}`,
            },
            ...prev.quizResults,
          ].slice(0, 30),
          activities: [
            {
              id: `act-${Date.now()}`,
              type: "quiz-score" as const,
              text: "Quiz Score",
              highlight: `${result.score}/${result.total}`,
              date: new Date().toISOString(),
            },
            ...prev.activities,
          ],
        };
        persist(next);
        return next;
      });
    },
    []
  );

  const advanceDailyChallenge = useCallback(() => {
    setData((prev) => {
      const today = new Date().toISOString().slice(0, 10);
      const reset = prev.dailyChallengeDate !== today;
      const next = {
        ...prev,
        dailyChallengeDate: today,
        dailyChallengeIndex: reset
          ? 1
          : Math.min(prev.dailyChallengeIndex + 1, 5),
      };
      persist(next);
      return next;
    });
  }, []);

  const markQuestionRevised = useCallback((questionId: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? { ...q, lastRevisedAt: new Date().toISOString() }
            : q
        ),
        activities: [
          {
            id: `act-rev-${Date.now()}`,
            type: "revision-completed" as const,
            text: "Revision Completed",
            highlight:
              prev.questions.find((q) => q.id === questionId)?.name ?? "",
            date: new Date().toISOString(),
          },
          ...prev.activities,
        ],
      };
      persist(next);
      return next;
    });
  }, []);

  const memoryScore = useMemo(() => getMemoryScore(data), [data]);

  const value = useMemo(
    () => ({
      data,
      updateQueueItem,
      completeQueueItem,
      skipQueueItem,
      reviewAgainQueueItem,
      addQuizResult,
      advanceDailyChallenge,
      markQuestionRevised,
      memoryScore,
    }),
    [
      data,
      updateQueueItem,
      completeQueueItem,
      skipQueueItem,
      reviewAgainQueueItem,
      addQuizResult,
      advanceDailyChallenge,
      markQuestionRevised,
      memoryScore,
    ]
  );

  return (
    <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
  );
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error("useMemory must be used within MemoryProvider");
  return ctx;
}

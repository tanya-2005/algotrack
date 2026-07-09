import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData, QuizResult, RevisionQueueItem } from "../lib/types";
import { defaultAppData } from "../lib/seedData";
import { supabase } from "../lib/supabase";
import { isDemoMode } from "../lib/demoMode";
import {
  advanceStar,
  buildRevisionQueueFromData,
  computeNextRevisionDate,
  getMemoryScore,
  regressStar,
} from "../lib/memoryEngine";
import { fetchRealMemoryData } from "../services/memoryDataService";
import { recordRevisionOutcome } from "../services/revisionService";

// Local-only fields (see MEMORY.md audit: no backing Supabase tables yet).
// questions/patterns are never persisted here - Demo Mode always uses the
// fixed seed data, real accounts always refetch from Supabase.
type LocalOnlyState = Pick<
  AppData,
  "activities" | "quizResults" | "dailyChallengeIndex" | "dailyChallengeDate"
>;

const DEMO_STORAGE_KEY = "dsa-memory-data:demo";
const storageKeyForUser = (userId: string) => `dsa-memory-data:${userId}`;

function emptyLocalOnlyState(): LocalOnlyState {
  return {
    activities: [],
    quizResults: [],
    dailyChallengeIndex: 0,
    dailyChallengeDate: new Date().toISOString().slice(0, 10),
  };
}

function loadLocalOnlyState(
  key: string,
  fallback: LocalOnlyState
): LocalOnlyState {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    /* use fallback */
  }
  return fallback;
}

function persistLocalOnlyState(key: string, data: AppData) {
  const { activities, quizResults, dailyChallengeIndex, dailyChallengeDate } =
    data;
  localStorage.setItem(
    key,
    JSON.stringify({
      activities,
      quizResults,
      dailyChallengeIndex,
      dailyChallengeDate,
    })
  );
}

function initialAppData(): AppData {
  if (isDemoMode()) {
    const local = loadLocalOnlyState(DEMO_STORAGE_KEY, {
      activities: defaultAppData.activities,
      quizResults: defaultAppData.quizResults,
      dailyChallengeIndex: defaultAppData.dailyChallengeIndex,
      dailyChallengeDate: defaultAppData.dailyChallengeDate,
    });
    return { ...defaultAppData, ...local };
  }

  // Real account (or auth still resolving): start empty rather than
  // showing Demo Mode's fake seed content under a real login. The fetch
  // effect below fills in real questions/patterns and this specific
  // account's own local state once the session resolves.
  return {
    questions: [],
    patterns: [],
    revisionQueue: [],
    ...emptyLocalOnlyState(),
  };
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
  memoryScore: number;
};

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialAppData);

  // "" means "real account, but which one is still resolving" - writes are
  // held back until we know whose local storage they belong to, so one
  // account's activity/quiz history never bleeds into another's.
  const storageKeyRef = useRef<string>(
    isDemoMode() ? DEMO_STORAGE_KEY : ""
  );

  const persist = useCallback((next: AppData) => {
    if (!storageKeyRef.current) return;
    persistLocalOnlyState(storageKeyRef.current, next);
  }, []);

  // For a logged-in user, load that specific account's own local state and
  // swap the demo/seed questions & patterns for their real Supabase data.
  // Demo Mode never touches Supabase and keeps its existing seed-driven
  // behavior, fully isolated under its own storage key.
  useEffect(() => {
    if (isDemoMode()) return;

    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (cancelled || !user) return;

      const key = storageKeyForUser(user.id);
      storageKeyRef.current = key;
      const local = loadLocalOnlyState(key, emptyLocalOnlyState());

      try {
        const real = await fetchRealMemoryData();
        if (cancelled || !real) return;
        setData((prev) => ({
          ...prev,
          ...local,
          questions: real.questions,
          patterns: real.patterns,
          revisionQueue: buildRevisionQueueFromData(
            real.questions,
            real.patterns
          ),
        }));
      } catch (err) {
        console.error("Failed to load real memory data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const skipQueueItem = useCallback(
    (id: string) => updateQueueItem(id, { skipped: true }),
    [updateQueueItem]
  );

  // Successful recall advances the question's revision star (max 5) and
  // reschedules it further out; a forgotten review regresses the star
  // (min 1) and reschedules it sooner - a Leitner-style spaced repetition
  // system (see memoryEngine's STAR_INTERVAL_DAYS). Pattern/reflection
  // queue items have no single underlying question, so they only update
  // their own completed/reviewAgain flag. Demo Mode never calls Supabase -
  // only the local question/queue state is updated there.
  const applyRevisionOutcome = useCallback(
    (queueItemId: string, recalled: boolean) => {
      setData((prev) => {
        const queueItem = prev.revisionQueue.find(
          (i) => i.id === queueItemId
        );
        const questionId = queueItem?.questionId;

        if (!questionId) {
          const next: AppData = {
            ...prev,
            revisionQueue: prev.revisionQueue.map((item) =>
              item.id === queueItemId
                ? recalled
                  ? { ...item, completed: true, reviewAgain: false }
                  : { ...item, reviewAgain: true, completed: false }
                : item
            ),
          };
          persist(next);
          return next;
        }

        const question = prev.questions.find((q) => q.id === questionId);
        const currentStar = question?.revisionStar ?? 1;
        const newStar = recalled
          ? advanceStar(currentStar)
          : regressStar(currentStar);
        const nextRevisionAt = computeNextRevisionDate(newStar);
        const nowIso = new Date().toISOString();

        const next: AppData = {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  revisionStar: newStar,
                  nextRevisionAt,
                  lastRevisedAt: nowIso,
                }
              : q
          ),
          revisionQueue: prev.revisionQueue.map((item) =>
            item.id === queueItemId
              ? recalled
                ? {
                    ...item,
                    completed: true,
                    reviewAgain: false,
                    star: newStar,
                    nextRevisionAt,
                  }
                : {
                    ...item,
                    reviewAgain: true,
                    completed: false,
                    star: newStar,
                    nextRevisionAt,
                  }
              : item
          ),
          activities: [
            {
              id: `act-rev-${Date.now()}`,
              type: "revision-completed" as const,
              text: recalled ? "Revision Completed" : "Marked for Review",
              highlight: question?.name ?? queueItem?.title ?? "",
              date: nowIso,
            },
            ...prev.activities,
          ],
        };

        persist(next);

        if (!isDemoMode()) {
          recordRevisionOutcome(questionId, currentStar, recalled).catch(
            (err) => {
              console.error("Failed to persist revision outcome:", err);
            }
          );
        }

        return next;
      });
    },
    [persist]
  );

  const completeQueueItem = useCallback(
    (id: string) => applyRevisionOutcome(id, true),
    [applyRevisionOutcome]
  );

  const reviewAgainQueueItem = useCallback(
    (id: string) => applyRevisionOutcome(id, false),
    [applyRevisionOutcome]
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

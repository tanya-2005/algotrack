import { useState } from "react";
import RevisionHero from "../components/revision/RevisionHero";
import AIQuizArena, {
  QuizSessionModal,
} from "../components/revision/AIQuizArena";
import RevisionQueuePanel from "../components/revision/RevisionQueuePanel";
import ReflectionRecall from "../components/revision/ReflectionRecall";
import PatternChallenge from "../components/revision/PatternChallenge";
import QuizResultsHistory from "../components/revision/QuizResultsHistory";
import { useMemory } from "../context/MemoryContext";
import { generateDailyQuiz } from "../lib/quizEngine";
import type { QuizQuestion } from "../lib/types";
import "../styles/revision.css";

function Revision() {
  const { addQuizResult, data } = useMemory();
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizReady, setQuizReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleGenerate = () => {
    const generated = generateDailyQuiz(data);
    setQuiz(generated);
    setQuizReady(true);
  };

  const handleQuizComplete = (score: number, total: number) => {
    addQuizResult({
      date: new Date().toISOString(),
      score,
      total,
    });
  };

  return (
    <div className="revision-page">
      <RevisionHero />
      <AIQuizArena
        quizReady={quizReady}
        quiz={quiz}
        onGenerate={handleGenerate}
        onStartQuiz={() => setShowQuiz(true)}
      />
      <RevisionQueuePanel />

      <div className="rev-learning-grid">
        <ReflectionRecall />
        <PatternChallenge />
      </div>

      <QuizResultsHistory />

      {showQuiz && quiz.length > 0 && (
        <QuizSessionModal
          quiz={quiz}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}

export default Revision;

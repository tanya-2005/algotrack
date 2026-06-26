import "../../styles/patterns.css";

interface PatternHeroProps {
  name: string;
  confidence: number;
  solvedQuestions: number;
  lastRevised: string;
  dueQuestions: number;
  status: string;
}

const PatternHero = ({
  name,
  confidence,
  solvedQuestions,
  lastRevised,
  dueQuestions,
  status,
}: PatternHeroProps) => {
  return (
    <div className="hero-v3">

      <div className="hero-main">

        <div className="hero-heading">

          <p className="hero-label">
            ALGORITHMIC PATTERN
          </p>

          <h1>{name}</h1>

          <p className="hero-desc">
            Efficiently process contiguous arrays and substrings
            by maintaining a dynamic window instead of repeatedly
            recalculating information.
          </p>

        </div>

        <div className="hero-status">
          {status}
        </div>

      </div>

      <div className="hero-metrics">

        <div className="metric">
          <span>Questions Solved</span>
          <h2>{solvedQuestions}</h2>
        </div>

        <div className="metric">
          <span>Confidence</span>
          <h2>{confidence}/5</h2>
        </div>

        <div className="metric">
          <span>Last Revised</span>
          <h2>{lastRevised}</h2>
        </div>

        <div className="metric danger">
          <span>Pending Review</span>
          <h2>{dueQuestions}</h2>
        </div>

      </div>

    </div>
  );
};

export default PatternHero;
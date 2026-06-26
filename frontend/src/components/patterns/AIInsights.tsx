import "../../styles/patterns.css";

type Props = {
  summary: any;
  generating: boolean;
  onGenerate: () => void;
};

const AIInsights = ({
  summary,
  generating,
  onGenerate,
}: Props) => {
  return (
    <>
      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={generating}
      >
        {generating ? "Generating..." : "Generate AI Summary"}
      </button>

      <div className="insights-grid">
        {summary ? (
          <>
            <div className="insight-card">
              <strong>Overview</strong>
              <br />
              {summary.overview}
            </div>

            <div className="insight-card">
              <strong>Recognition</strong>
              <br />
              {summary.recognition}
            </div>

            <div className="insight-card">
              <strong>Mistakes</strong>
              <br />
              {summary.mistakes}
            </div>

            <div className="insight-card">
              <strong>Optimization</strong>
              <br />
              {summary.optimization}
            </div>

            <div className="insight-card">
              <strong>Interview</strong>
              <br />
              {summary.interview}
            </div>

            <div className="insight-card">
              <strong>Revision Tip</strong>
              <br />
              {summary.revisionTip}
            </div>
          </>
        ) : (
          <div className="insight-card">
            Click "Generate AI Summary".
          </div>
        )}
      </div>
    </>
  );
};

export default AIInsights;
import "../../styles/patterns.css";

interface PatternNotesProps {
  summary: any;
}

const PatternNotes = ({ summary }: PatternNotesProps) => {
  return (
    <div className="notes-card">
      <div className="section-top">
        <h2>Your Learning Summary</h2>
      </div>

      <div className="note-card">
        {summary?.memorySummary?.progress ??
          "Generate an AI summary to see your personalized learning journey."}
      </div>

      <h3 style={{ marginTop: "28px", marginBottom: "14px" }}>
        Next Focus
      </h3>

      <div className="note-card">
        
          {summary?.memorySummary?.nextFocus ? (
  <ul className="focus-list">
    {summary.memorySummary.nextFocus.map(
      (item: string, index: number) => (
        <li key={index}>{item}</li>
      )
    )}
  </ul>
) : (
  "Your personalized next focus will appear here after generating the AI summary."
)}
      </div>
    </div>
  );
};

export default PatternNotes;
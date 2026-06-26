type ReflectionPreviewProps = {
  trigger: string;
  mistake?: string;
  pattern?: string;
};

function ReflectionPreview({
  trigger,
  mistake,
  pattern,
}: ReflectionPreviewProps) {
  return (
    <div className="reflection-preview">
      <span className="preview-label">Memory Trigger</span>
      <p>{trigger}</p>
      {mistake && (
        <p className="preview-meta">
          <strong>Mistake:</strong> {mistake}
        </p>
      )}
      {pattern && (
        <p className="preview-meta">
          <strong>Pattern:</strong> {pattern}
        </p>
      )}
      <span className="preview-link">View Reflection →</span>
    </div>
  );
}

export default ReflectionPreview;

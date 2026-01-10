export default function VersionDisplay({ version }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-matrix-dark border border-matrix-green border-opacity-20 p-4 space-y-2 text-sm font-mono">
      <div className="flex justify-between">
        <span className="text-matrix-green-dim">VERSION:</span>
        <span className="text-matrix-green">{version.matrix_version}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-matrix-green-dim">CREATED:</span>
        <span className="text-matrix-green-dim">
          {formatDate(version.created_at)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-matrix-green-dim">LAST RESET:</span>
        <span className="text-matrix-green-dim">
          {formatDate(version.last_reset_at)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-matrix-green-dim">RESET COUNT:</span>
        <span
          className={`${
            version.reset_count >= 5 ? "text-red-500" : "text-matrix-green"
          }`}
        >
          {version.reset_count}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-matrix-green-dim">INITIALIZED:</span>
        <span
          className={version.initialized ? "text-matrix-green" : "text-red-500"}
        >
          {version.initialized ? "YES" : "NO"}
        </span>
      </div>
    </div>
  );
}

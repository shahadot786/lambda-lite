import { useEffect, useRef } from 'react';

interface LogViewerProps {
  logs: string;
  error?: string;
}

export default function LogViewer({ logs, error }: LogViewerProps) {
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, error]);

  return (
    <div className="log-viewer">
      <h3>Execution Logs</h3>
      <pre ref={logRef} className="logs">
        {logs || 'No logs yet...'}
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}
      </pre>
    </div>
  );
}

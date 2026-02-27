import React from 'react';

function Logs({ logs, clearLogs }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Logs</h2>
        {logs.length > 0 && (
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={clearLogs}
          >
            Clear logs
          </button>
        )}
      </div>
      {logs.length === 0 ? (
        <p>No log entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log, idx) => (
            <li
              key={idx}
              className={`p-2 bg-white rounded shadow flex justify-between items-center ${
                log.status === 'passed' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
              }`}
            >
              <span>{log.time} – {log.message}</span>
              <span className={log.status === 'passed' ? 'text-green-600' : 'text-red-600'}>
                {log.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Logs;

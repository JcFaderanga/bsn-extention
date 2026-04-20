import React from 'react'

const ElementSelector = () => {
  return (
    <div>
         {/* <div className="p-4 bg-white rounded shadow">
          <p className="mb-2">
            <strong>Tracking:</strong> <span className={trackingEnabled ? 'text-green-600' : 'text-red-600'}>{trackingEnabled ? 'Enabled' : 'Disabled'}</span>
          </p>
          {lastClick ? (
            <div className="space-y-1">
              <p><strong>Last clicked element:</strong></p>
              <p>Tag: {lastClick.tag}</p>
              <p>ID: {lastClick.id}</p>
              <p>Class: {lastClick.className}</p>
              <p>Name: {lastClick.name}</p>
            </div>
          ) : (
            <p>No element clicked yet.</p>
          )}

          {testResult && (
            <div className="mt-2">
              <p><strong>Test result:</strong> {testResult.message}</p>
              <p>Status: <span className={testResult.status==='passed'?'text-green-600':'text-red-600'}>{testResult.status.toUpperCase()}</span></p>
              <button
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                onClick={goToLogs}
              >
                View logs
              </button>
            </div>
          )}
        </div> */}
    </div>
  )
}

export default ElementSelector

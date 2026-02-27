import React, { useState } from 'react';

function Settings() {
  const [optionA, setOptionA] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [status, setStatus] = useState('');

  const handleSave = () => {
    // placeholder: save other options to storage or future logic
    setStatus('Settings saved successfully');
    setTimeout(() => setStatus(''), 3000);
  };

  const toggleTracking = (enable) => {
    setTrackingEnabled(enable);
    // persist choice
    chrome.storage.local.set({ trackingEnabled: enable });

    // notify content scripts in all existing tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'setTracking', enabled: enable }, () => {
            // ignore errors (tab might not have our script)
            if (chrome.runtime.lastError) {
              // console.log('sendMessage error', chrome.runtime.lastError.message);
            }
          });
        }
      });
    });
  };

  // load current tracking state from storage when component mounts
  React.useEffect(() => {
    chrome.storage.local.get(['trackingEnabled'], (result) => {
      if (typeof result.trackingEnabled === 'boolean') {
        setTrackingEnabled(result.trackingEnabled);
      }
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="optionA"
            type="checkbox"
            checked={optionA}
            onChange={(e) => setOptionA(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="optionA">Option A (placeholder)</label>
        </div>

        {/* tracking toggle */}
        <div className="flex items-center">
          <input
            id="trackingToggle"
            type="checkbox"
            checked={trackingEnabled}
            onChange={(e) => toggleTracking(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="trackingToggle">Enable click/highlight tracking</label>
        </div>


        {/* tracking toggle */}
        <div className="flex items-center">
          <input
            id="trackingToggle"
            type="checkbox"
            checked={trackingEnabled}
            onChange={(e) => toggleTracking(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="trackingToggle">Enable click/highlight tracking</label>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
        {status && <p className="text-green-600">{status}</p>}
      </div>
    </div>
  );
}

export default Settings;
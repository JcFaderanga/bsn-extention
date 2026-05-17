import React, { useEffect, useState } from 'react';
import Dashboard from './Tabs/Dashboard';
import Settings from './Tabs/Settings';
import Logs from './Tabs/Logs';
import { LuComputer } from "react-icons/lu";

const TABS = ['Dashboard', 'Settings', 'Logs'];

function SidePanel() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [logs, setLogs] = useState([]);
  const [lastClick, setLastClick] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const addLog = (entry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  useEffect(() => {
    chrome?.storage?.local?.get(['logs', 'trackingEnabled'], (result) => {
      if (Array.isArray(result.logs)) {
        setLogs(result.logs);
      }
      if (typeof result.trackingEnabled === 'boolean') {
        setTrackingEnabled(result.trackingEnabled);
      }
    });

    // listen for messages from content script or settings toggle
    const handler = (msg) => {
      if (msg.type === 'elementClick' && msg.payload) {
        const { tag, id, className, name, message, status } = msg.payload;
        const time = new Date().toLocaleString();
        setLastClick({ tag, id, className, name });
        setTestResult({ message, status });
        addLog({ time, message, status });
      } else if (msg.type === 'setTracking' && typeof msg.enabled === 'boolean') {
        setTrackingEnabled(msg.enabled);
      }
    };
    chrome?.runtime?.onMessage?.addListener(handler);

    return () => {
      chrome?.runtime?.onMessage?.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    chrome?.storage?.local?.set({ logs });
  }, [logs]);

  useEffect(() => {
    // read last tab from storage when component mounts
    chrome?.storage?.local?.get(['lastTab'], (result) => {
      if (result.lastTab && TABS.includes(result.lastTab)) {
        setActiveTab(result.lastTab);
      }
    });
  }, []);

  useEffect(() => {
    // persist selection
    chrome?.storage?.local?.set({ lastTab: activeTab });
  }, [activeTab]);

  const clearLogs = () => {
    setLogs([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Settings':
        return <Settings />;
      case 'Logs':
        return <Logs logs={logs} clearLogs={clearLogs} />;
      case 'Dashboard':
      default:
        return (
          <Dashboard
            lastClick={lastClick}
            testResult={testResult}
            goToLogs={() => setActiveTab('Logs')}
            trackingEnabled={trackingEnabled}
          />
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <header className="p-4 shadow-sm bg-white flex justify-between">
        <span className='flex gap-1 items-center text-blue-600'>
            <LuComputer size={16} />
            QA Assist
        </span>
        <i className='text-gray-500 text-sm'>v2.14.1</i>
      </header>
      <nav className="flex border-b bg-white">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 text-center ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 font-medium'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <main className="flex-1 overflow-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
}

export default SidePanel;
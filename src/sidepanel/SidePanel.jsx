import React, { useEffect, useState } from 'react';
import Dashboard from './Tabs/Dashboard';
import MaskMode from './Tabs/MaskMode';
import MainWrapper from '../components/wrapper/MainWrapper';
import { getLocalStorage, setLocalStorage } from '../utils/useLocalStorage';

const TABS = ['Dashboard', 'Mask Mode'];
const STORAGE_KEYS = {
  TAB: 'lastTab',
};

function SidePanel() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [logs, setLogs] = useState([]);
  const [lastClick, setLastClick] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

	// Load from localStorage on mount
	useEffect(() => {
		const savedTab = getLocalStorage(STORAGE_KEYS.TAB);

		if (savedTab && TABS.includes(savedTab)) {
			setActiveTab(savedTab);
		}
	}, []);

  // Persist tab
  useEffect(() => {
      setLocalStorage(STORAGE_KEYS.TAB, activeTab, false);
  }, [activeTab]);

  const renderContent = () => {
		switch (activeTab) {
			case 'Mask Mode':
				return <MaskMode />;
			default:
				return <Dashboard />;
		}
  };

return (
	<MainWrapper>
		<div className="h-full w-full flex flex-col">

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
	</MainWrapper>
)}

export default SidePanel;
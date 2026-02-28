import React, { useState } from 'react';
import Menu from '../components/dashboard/menu';
import mockData from '../../data/mockData';
import { FaUserAlt, FaKey } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

function Dashboard({ lastClick, testResult, goToLogs, trackingEnabled }) {
  const [subTab, setSubTab] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);

  // ✅ Must match mockData keys exactly
  const roles = [
    'Admin',
    'Employee',
    'Manager',
    'Manager Admin',
    'Partner Admin'
  ];

  // helper that sends a message to the content script in the active tab
  const handleLogin = (email, password) => {
    if (!email || !password) {
      console.error('email/password missing');
      return;
    }
    if (chrome && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { type: 'doLogin', email, password },
            (resp) => {
              if (resp && resp.status === 'error') {
                console.error('login error', resp.message);
              }
            }
          );
        } else {
          console.warn('no active tab to message');
        }
      });
    } else {
      console.warn('chrome.tabs API not available');
    }
  };

  return (
    <div>
      <div className='text-slate-400 my-1'>v1.0.6 - Dashboard</div>
      <div className="space-y-4">
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

        {/* login auth card */}
        { !subTab &&
          <Menu 
              setSubtab={(tab) => tab === subTab ? setSubTab(null) : setSubTab(tab)} 
          />
        }
      
        {subTab === 'userLogins' && (
          <div className="p-4 bg-white rounded shadow space-y-2">
            <button
              className="mt-2 text-sm text-gray-500 underline"
              onClick={() => {
                setSubTab(null);
                setExpandedRole(null);
              }}
            >
              Back to Menu
            </button>

            <h3 className="font-semibold">Choose role</h3>

            <div className="flex flex-col space-y-1">
              {roles.map(r => {

                const data = mockData?.[r];

                // Normalize to always be an array
                const accounts = Array.isArray(data)
                  ? data
                  : data
                  ? [data]
                  : [];

                return (
                  <div key={r}>
                    <div
                      className="px-3 py-2 border border-gray-300 rounded-lg text-left cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setExpandedRole(prev => prev === r ? null : r)
                      }
                    >
                      {r}
                    </div>

                    {expandedRole === r && (
                      <div className="ml-4 mt-2 space-y-2">
                        {accounts.map((item, index) => (
                          <div 
                            key={index} 
                            className="p-2 bg-gray-100 text-slate-600 rounded-xl flex justify-between"
                            
                            >
                            <div className="w-[85%] flex flex-col gap-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <FaUserAlt size={14} />
                                <span title={item.email} className="truncate">{item.email}</span>
                              </div>

                              <div className="flex items-center gap-2 min-w-0">
                                <FaKey size={14} />
                                <span title={item.password} className="truncate">
                                  {item.password}
                                </span>
                              </div>
                            </div>

                            <div 
                              className='border rounded-xl flex items-center justify-center bg-gray-200 text-gray-600 px-3 hover:bg-gray-300 cursor-pointer'
                              title='Use this cridential to login.'
                              onClick={() => handleLogin(item.email, item.password)}
                            >
                              <IoIosArrowForward size={16}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* <div className="p-4 bg-white rounded shadow">Another card</div> */}
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState } from 'react';
import Menu from '../components/dashboard/menu';
import { QA_User, Prod_User } from '../../data';
import { FaUserAlt, FaKey } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import LoginAuth from '../components/dashboard/LoginAuth';
function Dashboard({ lastClick, testResult, goToLogs, trackingEnabled }) {
  const [subTab, setSubTab] = useState(null);


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
          <LoginAuth 
            setSubTab={(e) => {
              setSubTab(null);
            }} 
          />
        )}

          {subTab === 'annotator' && (
            <div className="p-4 bg-white rounded shadow">
              <button
              className="mt-2 text-sm text-gray-500 underline"
              onClick={() => setSubTab(null)}
            >
              Back to Menu
            </button>
              <h2 className="text-lg font-bold mb-2">Annotator</h2>
              <p>Manage annotator information here.</p>
            </div>
          )}

        {/* <div className="p-4 bg-white rounded shadow">Another card</div> */}
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState } from 'react';
import { QA_User, Prod_User } from '../../../data';
import { FaUserAlt, FaKey } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

const LoginAuth = ({ setSubTab }) => {
  const [expandedRoleProd, setExpandedRoleProd] = useState(null);
  const [expandedRoleQA, setExpandedRoleQA] = useState(null);
  // ✅ Must match QA_User keys exactly
  const roles = [
    'Admin',
    'Partner Admin',
    'Manager Admin',
    'Manager',
    'Employee',
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
    <div className="p-4 bg-white rounded shadow space-y-2">
      <button
        className="mt-2 text-sm text-gray-500 underline"
        onClick={() => {
          setSubTab(null);
          setExpandedRoleProd(null);
          setExpandedRoleQA(null);
        }}
      >
        Back to Menu
      </button>
      {/* ============= */}
      <details>
        <summary>Production Environment</summary>
        <div className="flex flex-col space-y-1">
          {roles.map(r => {
            // strip spaces from role name when looking up QA_User keys
            const key = r.replace(/\s+/g, '');
            const data = Prod_User?.[key];

            if (!data) return;

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
                    setExpandedRoleProd(prev => prev === r ? null : r)
                  }
                >
                  {r}
                </div>

                {expandedRoleProd === r && (
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

                          {
                            item.password && (
                              <div className="flex items-center gap-2 min-w-0">
                                <FaKey size={14} />
                                <span title={item.password} className="truncate">
                                  {item.password}
                                </span>
                              </div>
                            )
                          }
                        </div>

                        <div 
                          className='border rounded-xl flex items-center justify-center bg-gray-200 text-gray-600 px-3 hover:bg-gray-300 cursor-pointer'
                          title='Use this credential to login.'
                          onClick={() => handleLogin(item.email, item.password ?? ' ')}
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
      </details>
      <details>
        {/* ============= */}
        <summary>QA Environment</summary>
        <div className="flex flex-col space-y-1">
          {roles.map(r => {
            // strip spaces from role name when looking up QA_User keys
            const key = r.replace(/\s+/g, '');
            const data = QA_User?.[key];

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
                    setExpandedRoleQA(prev => prev === r ? null : r)
                  }
                >
                  {r}
                </div>

                {expandedRoleQA === r && (
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
                          {
                            item.password && (
                              <div className="flex items-center gap-2 min-w-0">
                                <FaKey size={14} />
                                <span title={item.password} className="truncate">
                                  {item.password}
                                </span>
                              </div>
                            )
                          }
                        </div>

                        <div 
                          className='border rounded-xl flex items-center justify-center bg-gray-200 text-gray-600 px-3 hover:bg-gray-300 cursor-pointer'
                          title='Use this credential to login.'
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
      </details> 
    </div>
  );
};

export default LoginAuth;

import React, { useState } from 'react';

const GetToken = ({ setSubTab }) => {
  const [token, setToken] = useState(null);

  const handleGetToken = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return localStorage.getItem("accessToken");
        },
      });

      const tokenFromPage = result[0]?.result;
      setToken(tokenFromPage);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4"> </h3>

      <button
        onClick={handleGetToken}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Token
      </button>

      {token && (
        <div className="mt-4 p-3 bg-gray-100 rounded break-all text-[9px]">
          {token}
        </div>
      )}

      {!token && (
        <div className="mt-4 text-sm text-gray-400">
          No token found
        </div>
      )}
    </div>
  );
};

export default GetToken;
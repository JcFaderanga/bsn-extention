import React, { useEffect, useState } from 'react';

const GenerateToken = () => {
  const [access, setAccess] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [now, setNow] = useState(Date.now());

  // timer for expiration of token
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const Credentials = {
    Admin: 'admin@142.com',
    PartnerAdmin: 'jc_pa@test.com',
    ManagerAdmin: 'manageradmin@142.com',
    Manager: 'manager@142.com',
    Employee: 'employee@142.com',
  };

  const BASE_URL = "https://qa.api.pii-protect.com";
  const DEFAULT_PASSWORD = 'Working@@123';

//   const GroupID = {
//     'VFhjOVBRPT0=': 'ROLE: Employee',
//     "VFdjOVBRPT0=": "ROLE: Manager",
//     "VG5jOVBRPT0=": "ROLE: Manager Admin",
//     "VGxFOVBRPT0=": "ROLE: Partner Admin",
//     "VFZFOVBRPT0=": "ROLE: Admin"
//   };

  // Load stored tokens
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('tokens') || '[]');
    setTokens(stored);
  }, []);

  // Save tokens
  const saveTokens = (updatedTokens) => {
    setTokens(updatedTokens);
    localStorage.setItem('tokens', JSON.stringify(updatedTokens));

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ tokens: updatedTokens });
    }
  };

  async function Login(selectedRole) {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/cognitomiddlewares/user/login`,
        {
          method: "POST",
          headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://qa-portal.breachsecurenow.com"
          },
          body: JSON.stringify({
            email: Credentials[selectedRole],
            password: DEFAULT_PASSWORD
          })
        }
      );

      const data = await response.json();

      const expiresIn = data?.AuthenticationResult?.ExpiresIn;
      const expiresAt = Date.now() + expiresIn * 1000;

      const newToken = {
        id: Date.now(),
        role: selectedRole,
        token: data?.AuthenticationResult?.IdToken,
        groupID: data?.user?.group_id,
        expiresAt
      };

      const updatedTokens = [newToken, ...tokens];
      saveTokens(updatedTokens);

      setAccess(newToken);

    } catch (error) {
      console.error("Login error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function Logout(tokenObj) {
    try {
      await fetch(`${BASE_URL}/cognitomiddlewares/user/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_token: tokenObj.token
        })
      });

      removeToken(tokenObj.id);

    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const removeToken = (id) => {
    const filtered = tokens.filter(t => t.id !== id);
    saveTokens(filtered);
  };

  const handleGenerate = async () => {
    if (!role) return alert("Please select a role");
    await Login(role);
  };

  // Realtime countdown
  const getRemainingTime = (expiresAt) => {
    const diff = expiresAt - now;

    if (diff <= 0) return "Expired";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Auto remove expired tokens
  useEffect(() => {
    const interval = setInterval(() => {
      const filtered = tokens.filter(t => t.expiresAt > Date.now());
      if (filtered.length !== tokens.length) {
        saveTokens(filtered);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">

      {/* Controls */}
      <div className='flex gap-2'>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        <select
          className='w-full border px-2 rounded-lg'
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="PartnerAdmin">Partner Admin</option>
          <option value="ManagerAdmin">Manager Admin</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
        </select>
      </div>

      {/* Token Cards */}
      <div className="mt-6 space-y-3 max-h-[400px] overflow-auto">

        {tokens.length === 0 && (
          <div className="text-sm text-gray-400">No tokens found</div>
        )}

        {tokens.map((t) => {
          const isCollapsed = collapsed[t.id];

          return (
            <div key={t.id} className="border rounded-lg p-3 shadow-sm bg-gray-50">
                <div className=" text-blue-600 text-xs">
                    Token Expires in: {getRemainingTime(t.expiresAt)}
                </div>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className='flex gap-1 items-center '>
                            <div className="font-semibold text-sm">{t.role}</div> 
                        </div>
                    </div>

                    <div className="flex gap-2">
                    <button
                        onClick={() =>
                        setCollapsed(prev => ({ ...prev, [t.id]: !prev[t.id] }))
                        }
                        className="text-xs px-2 py-1 border rounded"
                    >
                        {isCollapsed ? "Expand" : "Minimize"}
                    </button>

                    <button
                        onClick={() => removeToken(t.id)}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                    >
                        Delete
                    </button>

                    <button
                        onClick={() => Logout(t)}
                        className="text-xs px-2 py-1 bg-gray-800 text-white rounded"
                    >
                        Kill
                    </button>
                    </div>
                </div>

                {/* Body */}
                {!isCollapsed && (
                    <div className="mt-2 text-[10px] break-all">
                    {t.token}
                    </div>
                )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerateToken;



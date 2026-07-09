import React, { useEffect } from 'react';
import SidePanel from './sidepanel/SidePanel';
import { COMMON_REQUEST } from './utils/useCommonAPI';
import { getCached } from './utils/useAPIRequest';
const EMAILS = {
    Admin: "admin@142.com",
    // PartnerAdmin: "pa@142.com",
    // ManagerAdmin: "manageradmin@142.com",
    // Manager: "manager@142.com",
    // Employee: "employee@142.bpp",
};

const EXPIRY_BUFFER = 30 * 1000;

function isValid(token) {
    return token?.expiresAt && token.expiresAt > Date.now() + EXPIRY_BUFFER;
}

// =====================
// MAIN TOKEN LOADER
// =====================
async function loadAllTokens() {
    const request = new COMMON_REQUEST();

    const entries = Object.entries(EMAILS);

    const tasks = entries.map(async ([role, email]) => {
        const cached = getCached(role);

        if (cached && isValid(cached)) {
          console.log("Token Exist for: ",cached.role)
           return;
        }

        const res = await request.getAuthToken(email);
        console.log("Token Generated for: ", role)
    });

    await Promise.all(tasks);
}

function App() {
    useEffect(() => {
        async function init() {
            try { loadAllTokens() } 
            catch (err) {
                console.error("Token load error:", err);
            }
        }
        init();
    }, []);

    return <SidePanel />;
}

export default App;
import React, { useEffect, useState } from 'react';
import { GoDotFill } from "react-icons/go";
import { COMMON_REQUEST } from '../../utils/useCommonAPI';

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col py-0.5">
      <strong className='text-green-800'>{label}</strong>
      <span>{value || "N/A"}</span>
    </div>
  );
};

const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [isInfoCollapse, setInfoCollapse] = useState(false)
  const request = new COMMON_REQUEST();

  // =========================
  // INITIAL USER DATA
  // =========================
  const getUserData = () => {
    if (!chrome?.tabs || !chrome?.scripting) return;

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => localStorage.getItem("userData"),
        },
        ([res]) => {
          const raw = res?.result;

          let parsed = null;

          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = null;
          }

          setUserData({
            email: parsed?.profile?.email,
            product_name: parsed?.profile?.product_name,
            client_name: parsed?.profile?.client_name,
            partner_name: parsed?.profile?.partner_name,
            user_role: parsed?.profile?.user_role,
            group_id: parsed?.profile?.group_id,
          });
        }
      );
    });
  };

  // =========================
  // LOAD INITIAL DATA
  // =========================
  useEffect(() => {
    getUserData();
  }, []);

  // =========================
  // FIND USER
  // =========================
  useEffect(() => {
    if (!userData?.email) return;

    const findUser = async () => {
      try {
        const user = await request.searchUserByEmail(userData.email);

        if (!user) return;

        setUserData(prev => ({
          ...prev,
          client_id: user?.data?.client_id,
        }));
      } catch (err) {
        console.error("findUser error:", err);
      }
    };

    findUser();
  }, [userData?.email]);

  // =========================
  // FIND CLIENT
  // =========================
  useEffect(() => {
    if (!userData?.client_id) return;

    const findClient = async () => {
      try {
        const {data: client, success, error} = await request.searchClient(userData.client_id);

        setUserData(prev => ({
          ...prev,
          portal_client_id: client?.portal_client_id,
          portal_partner_id: client?.portal_partner_id,
          pax8_subscription_id: client?.pax8_subscription_id,
        }));
      } catch (err) {
        console.error("findClient error:", err);
      }
    };

    findClient();
  }, [userData?.client_id]);

  // =========================
  // DISPLAY DATA
  // =========================
  const {
    email,
    product_name,
    client_name,
    partner_name,
    user_role,
    group_id,
    portal_client_id,
    portal_partner_id,
    pax8_subscription_id,
  } = userData || {};

  const rolesAbbr = {
    "VFhjOVBRPT0=": 'E',
    "VFdjOVBRPT0=": 'M',
    "VG5jOVBRPT0=": 'MA',
    "VGxFOVBRPT0=": 'PA',
    "VFZFOVBRPT0=": 'A'
  };

  const tooltip = `
    Product: ${product_name || 'N/A'}
    Client: ${client_name || 'N/A'}
    Partner: ${partner_name || 'N/A'}
  `;

  const hasUser = !!email;

  const isUserBgStype = hasUser
    ? "border-green-500 bg-green-200"
    : "border-gray-200 bg-slate-100";

  const isDotStype = hasUser
    ? "text-green-700"
    : "text-red-500";

  return (
    <div className={`border ${isUserBgStype} px-4 py-2 my-2 border-gray-300 text-sm rounded-lg`}>

      <div className='flex justify-between items-center'>
        <div
          onClick={()=> setInfoCollapse(!isInfoCollapse)}
          className='flex items-center gap-1 rounded-lg w-full cursor-pointer'
          title={tooltip}
        >
          <GoDotFill className={isDotStype} />
          <span>{email || 'No active user'}</span>
        </div>

        {hasUser && (
          <div className='flex gap-1'>
            <strong className='text-green-800'>
              {rolesAbbr?.[group_id] || user_role || 'NA'}
            </strong>
          </div>
        )}
      </div>

      <div>
        { 
          isInfoCollapse &&
          userData &&
          portal_client_id &&
          portal_partner_id 
          ? 
            <div className="text-xs overflow-auto mt-2">
              <InfoRow label="Product Name:" value={product_name} />
              <InfoRow label="Client Name:" value={client_name} />
              <InfoRow label="Partner Name:" value={partner_name} />
              <InfoRow label="Client ID:" value={portal_client_id} />
              <InfoRow label="Partner ID:" value={portal_partner_id} />
              <InfoRow label="Subscription ID:" value={pax8_subscription_id} />
            </div>
          : email && isInfoCollapse
          ? <i className='opacity-35'>Getting client info...</i> 
          : ''
        }
      </div>
    </div>
  );
};

export default UserInfo;
import React, { useState } from 'react';

import {
  Menu,
  LoginAuth,
  CharLength,
  TaskTrack,
  GetToken,
  GenerateToken,
  Training,
  WelcomeMessage,
  MicroTraining,
} from '../../components/dashboard'
import LoginMaskMode from '../../components/maskMode/LoginMaskMode';
import UserInfo from '../../components/UI/UserInfo';

const Wrapper = ({ children, setSubTab }) => {
  return (
    <div>
      <button
        className="mt-2 text-sm text-gray-500 underline"
        onClick={() => setSubTab(null)}
      >
        Back to Menu
      </button>

      {children}
    </div>
  );
};

function MaskMode() {
const [subTab, setSubTab] = useState(null);
const [env, setEnv] = useState(
    localStorage.getItem('env') || 'QA'
);
const [maskUserData, setMaskUserData] = useState(
    localStorage.getItem('maskUserData') || null
)

    function handleEnvChange(e) {
        const value = e.target.value;

        setEnv(value);
        localStorage.setItem('env', value);
    }

    const Sections = {
        // userLogins: <LoginAuth />,
        charlength: <CharLength />,
        //taskTrack: <TaskTrack />,
        getToken: <GetToken />,
        GenerateToken: <GenerateToken />,
        Training: <Training />,
        WelcomeMessage: <WelcomeMessage />,
        MicroTraining: <MicroTraining />,
    };

  return (
    <>
      <div className='flex gap-2 my-2 items-center'>
        <label>Environment</label>
        <select 
        className='border rounded-lg p-1 px-2'
        value={env}
        onChange={handleEnvChange}
        >
            <option value="QA">QA</option>
            <option value="PRE">PRE</option>
        </select>
      </div>
        { maskUserData ? 'Logged in' : <LoginMaskMode/> }
    </>
  );
}

export default MaskMode;
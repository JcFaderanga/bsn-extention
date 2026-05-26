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

function Dashboard() {
  const [subTab, setSubTab] = useState(null);

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
      <UserInfo/>
      <div className="space-y-4">
        {!subTab && (
          <Menu setSubtab={(tab) => setSubTab(tab)} />
        )}

        {subTab && (
          <Wrapper setSubTab={setSubTab}>
            {Sections[subTab]}
          </Wrapper>
        )}
      </div>
    </>
  );
}

export default Dashboard;
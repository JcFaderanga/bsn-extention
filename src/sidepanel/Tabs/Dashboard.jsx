import React, { useState } from 'react';
import Menu from '../components/dashboard/menu';
import LoginAuth from '../components/dashboard/LoginAuth';
import CharLength from '../components/dashboard/CharLength';
import TaskTrack from '../components/dashboard/TaskTrack';
import GetToken from '../components/dashboard/GetToken';
import GenerateToken from '../components/dashboard/GenerateToken';
import Training from '../components/dashboard/Training';
import UserInfo from '../components/dashboard/extras/UserInfo';
import WelcomeMessage from '../components/dashboard/WelcomeMessage';
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
  };

  return (
    <div>
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
    </div>
  );
}

export default Dashboard;
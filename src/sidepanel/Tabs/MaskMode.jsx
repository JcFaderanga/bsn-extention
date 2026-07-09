import React, { useEffect, useState } from 'react';
import { setLocalStorage, getLocalStorage } from '../../utils/useLocalStorage';
import {
  LoginAuth,
  CharLength,
  GetToken,
  GenerateToken,
  Training,
  WelcomeMessage,
  MicroTraining,
} from '../../components/dashboard';
import UserInfoMaskMode from '../../components/maskMode/UserInfoMaskMode';
import LoginMaskMode from '../../components/maskMode/LoginMaskMode';
import MenuMaskMode from '../../components/maskMode/MenuMaskMode';

function MaskMode() {
const [subTab, setSubTab] = useState(null);

const [maskUserData, setMaskUserData] = useState(() => {
    const data = getLocalStorage('maskUserData');

    if (!data || data === 'undefined') return null;

    try {
        return data;
    } catch (err) {
        console.warn('Invalid maskUserData in localStorage:', data);
        return null;
    }
});


	// ✅ Function to update userData safely
	function updateUserData(data) {
		setMaskUserData(data);
		setLocalStorage('maskUserData', data);
	}

	function logoutUserData() {
		setMaskUserData(null);
		setLocalStorage('maskUserData', null);
		setLocalStorage('maskClientData', null);
	}

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


	const Sections = {
		UserInfo: <UserInfoMaskMode />,
	};
  return (
    <>
		<div className="flex gap-2 my-2 items-center">
			<button
				onClick={() => logoutUserData()}
				className="text-sm text-red-500 underline"
			>
				Logout
			</button>
		</div>
		
		{maskUserData ? (
			<div>
				{!subTab && (
					<>
						<div className='flex justify-between px-4'>
							<img 
								src={maskUserData?.user.logo_partner} 
								alt='partner logo' 
								className='h-16'
							/>
							<img 
								src={maskUserData?.user.logo_product} 
								alt='product logo'
								className='h-16'
							/>	
						</div>	
						<MenuMaskMode setSubtab={(tab) => setSubTab(tab)} />
					</>
				
				)}
				{subTab && (
					<Wrapper setSubTab={setSubTab}>
						{Sections[subTab]}
					</Wrapper>
				)}	
					{/* <pre className='text-xs'>
					{JSON.stringify(maskUserData, null, 2)}
				</pre> */}
			
			</div>
		) : (
			<LoginMaskMode onLogin={updateUserData} />
		)}
    </>
  );
}

export default MaskMode;
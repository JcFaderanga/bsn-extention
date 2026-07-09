import React, {useEffect, useState} from 'react'
import { LuComputer } from "react-icons/lu";
import { getLocalStorage, setLocalStorage } from '../../utils/useLocalStorage';

const Header = () => {
	const [env, setEnv] = useState(
	  () => getLocalStorage('env', false) || 'QA'
	);

  	// ✅ Listen for localStorage changes (cross-tab)
	useEffect(() => {
		const handler = (e) => {
			if (e.key === 'maskUserData') {
			setMaskUserData(e.newValue ? JSON.parse(e.newValue) : null);
			}

			if (e.key === 'env') {
			setEnv(e.newValue || 'QA');
			}
		};

		window.addEventListener('storage', handler);
		return () => window.removeEventListener('storage', handler);
	}, []);
	// ✅ Sync env changes
	function handleEnvChange(e) {
		const value = e.target.value;
		setEnv(value);
		setLocalStorage('env', value, false);
	}
		
  return (
    <header className="p-4 shadow-sm bg-white flex justify-between">
			<span className="flex gap-1 items-center text-blue-600">
				<LuComputer size={16} />
				QA Assist
			</span>
			<div className="flex gap-2 my-2 items-center">
				<label></label>
				<select
				className="border rounded-lg p-1 px-2"
				value={env}
				onChange={handleEnvChange}
				>
					<option value="QA">QA</option>
					<option value="QA2">QA2</option>
					<option value="PRE">PRE</option>
				</select>
			</div>
		</header>
  )
}

export default Header

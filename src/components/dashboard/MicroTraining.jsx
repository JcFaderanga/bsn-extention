import React, { useState } from "react";
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";

const MicroTraining = () => {
const [email, setEmail] = useState("");
const [MT, setMT] = useState("");
const [MTList, setMTList] = useState(null);
const [selectedMTs, setSelectedMTs] = useState([]);
const [isSpecificMT, setSpecificMT] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

  	const request = new COMMON_REQUEST();

	async function fetchTraining() {
		setLoading(true);
		setError(null);
		setMTList(null);
		setSelectedMTs([]);

		try {
		// 1. Get user
		const user_res = await request.getUserDataByLogin(email);

		if (!user_res?.success) {
			setError(
			user_res?.error?.description ||
				user_res?.error?.message ||
				"Failed to fetch user",
			);
			return;
		}

		const userId = user_res?.data?.user?.id;
		const userIdToken = user_res?.data?.AuthenticationResult?.IdToken;

		// 2. Get micro trainings
		const mt_res = await Request("GET", {
			url: `https://qa.api.pii-protect.com/TestAuthoringSystem/myDashboard/microTrainings/${userId}?_sort=published_date&_order=DESC`,
			authorization: userIdToken,
		});

		if (!mt_res?.success) {
			setError(
				`Failed to fetch micro trainings. ${
					mt_res?.error?.message || mt_res?.error?.description || ""
				}`,
			);
			return;
		}

		setMTList(mt_res?.data || []);
		} catch (err) {
			setError(err?.message || "Unexpected error occurred");
		} finally {
			setLoading(false);
		}
	}

	// Only trainings WITHOUT score can be selected
	const selectableMTs = MTList?.filter((mt) => mt.score === null) || [];

	const isAllSelected =
		selectableMTs.length > 0 &&
		selectableMTs.every((mt) => selectedMTs.includes(mt.mt_id));

	function handleSelectMT(mtId) {
		setSelectedMTs((prev) => {
			if (prev.includes(mtId)) {
				return prev.filter((id) => id !== mtId);
			}
			return [...prev, mtId];
		});
	}

	function handleSelectAll() {
		if (isAllSelected) {
			setSelectedMTs([]);
			return;
		}

		setSelectedMTs(selectableMTs.map((mt) => mt.mt_id));
	}

	async function handleAnswerAllSelected() {
		console.log("Selected MTs:", selectedMTs);
		// your logic here
	}

	return (
		<div className="p-4">
			{/* Inputs */}
			<div className="flex flex-col w-full gap-2 py-2">
				<Input
					type="email"
					value={email}
					onChange={setEmail}
					placeholder="Enter email here..."
				/>

				{/* Error Display */}
				{error && (
					<p className="text-red-500 w-full text-center border border-red-500 bg-red-50 p-2 rounded-xl">
						{typeof error === "object"
							? error?.description || error?.message || JSON.stringify(error)
							: error}
					</p>
				)}

				<Button
					title="Get Micro Trainings"
					onClick={fetchTraining}
					loading={loading}
					disabled={!email || loading}
				/>
			</div>

			{/* Select All + Action */}
			{MTList?.length > 0 && (
				<div className="flex items-center justify-between py-3 ">
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={isAllSelected}
							onChange={handleSelectAll}
						/>
						<p className="text-sm">Select all MT</p>
					</div>

					{selectedMTs.length > 0 && (
						<button
							onClick={() => handleAnswerAllSelected()}
							className="text-sm border bg-slate-200 px-4 py-0.5 rounded-lg"
						>
						Answer all ({selectedMTs.length})
						</button>
					)}
				</div>
			)}

			{/* Output */}
			{MTList?.map((mt) => {
				const isDisabled = mt.score !== null;
				const isChecked = selectedMTs.includes(mt.mt_id);

				return (
					<div
						key={mt.mt_id}
						className={`
						${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
						flex justify-between px-4 py-2 border border-gray-300 rounded-lg my-1
						`}
					>
						<div className="flex gap-2 items-center">
							<input
								type="checkbox"
								checked={isChecked}
								disabled={isDisabled}
								onChange={() => handleSelectMT(mt.mt_id)}
							/>
							<p>{mt.micro_training}</p>
						</div>
						<p>{mt.score}</p>
					</div>
				);
			})}
		</div>
	);
};

export default MicroTraining;

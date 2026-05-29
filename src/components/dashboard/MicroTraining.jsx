import React, { useState } from "react";
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";
import { ClipLoader } from "react-spinners";

const MicroTraining = () => {
const [email, setEmail] = useState("");
const [userToken, setUserToken] = useState("");
const [MT, setMT] = useState("");
const [MTList, setMTList] = useState(null);
const [selectedMTs, setSelectedMTs] = useState([]);
const [isSpecificMT, setSpecificMT] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

  	const request = new COMMON_REQUEST();
	const BASE_URL = "https://qa.api.pii-protect.com";

	async function fetchTraining() {
		setLoading(true);
		setError(null);
		setMTList(null);
		setSelectedMTs([]);

		try {
		// 1. Get user
		const {
			data: user_data,
			success: user_success,
			error: user_error
		} = await request.getUserDataByLogin(email);

		if (!user_success) {
			setError(user_error);
			return;
		}

		const userId = user_data?.user?.id;
		const userIdToken = user_data?.AuthenticationResult?.IdToken;
		setUserToken(userIdToken);
		// 2. Get micro trainings
		const {
			data: mt_data, 
			success: mt_sucess, 
			error: mt_error
		} = await Request("GET", {
			url: `https://qa.api.pii-protect.com/TestAuthoringSystem/myDashboard/microTrainings/${userId}?_sort=published_date&_order=DESC`,
			authorization: userIdToken,
		});

		if (!mt_sucess) {
			setError(
				`Failed to fetch micro trainings. ${mt_error}`,
			);
			return;
		}
	
		setMTList(mt_data || []);
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

	const getOrCreateRevision = async (quiz_id, token = userToken) => {
		
		async function getRevisionId (){
			const { data, error, status, success } = await Request('GET',{
				url: `${BASE_URL}/QuizManagementSystem/quiz-user-state/quiz/${quiz_id}`,
				authorization: token
			});

			if(!success){
				setError(error)
				return {
					success: false,
					error: error
				}
			}
			
			return {
				success: success,
				status: status,
				revision_id: data?.info?.revision_id
			};
		}

		async function resumeQuiz(revision_id) {

			if(!revision_id){
				setError('Invalid Revision Id')
			}

			const { data, error, status, success } = await Request('POST',{
				url: `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/resume`,
				authorization: token,
				body: { revision_id }
			});

			if(!success) {
				setError(error)
				return;
			}
			console.log("resumeQuiz =>", data)
			if (!data.revision_id || !data.questions) {
				setError('Invalid quiz session')
			}

			return {
				success: true,
				revision_id: data.revision_id,
				quiz_questions: data.questions
			};
		}

		async function createQuiz() {

			const { data, error, status } = await Request('POST',{
				url: `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/create`,
				authorization: token,
				body: { quiz_id }
			});

			if(!success) {
				setError(error)
				return;
			}

			console.log("createQuiz =>", data)
			if (!data.revision_id || !data.questions) {
				setError('Invalid quiz session')
			}

			return {
				success: true,
				revision_id: data.revision_id,
				quiz_questions: data.questions
			};
		}

		const {success, revision_id, status} = await getRevisionId();
		
		if (success && revision_id) {
			// Existing revision → resume
			return await resumeQuiz(revision_id);
		} else {
			// No revision → create
			return await createQuiz(revision_id);
		}

		throw new Error(`Unexpected revision response: ${status}`);
	};

	async function handleAnswerAllSelected() {
		console.log(selectableMTs)
		await Promise.all(
			selectedMTs.map(async(quiz_id)=>{
				
				const { success:quiz_success, revision_id, quiz_questions } = await getOrCreateRevision(quiz_id);
				console.log("quiz_questions", quiz_questions)

			})
		);		
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
					<div key={mt.mt_id} className={`
						${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
						 px-4 py-2 border border-gray-300 rounded-lg my-1
						`}>
						<div className="flex justify-between w-full">
							<div className="flex gap-2 items-center">

								<input
									type="checkbox"
									checked={isChecked}
									disabled={isDisabled}
									onChange={() => handleSelectMT(mt.mt_id)}
								/>
								<p>{mt.micro_training}</p>
							</div>

							<div>
								{mt.score
								? 	<p>{mt.score}</p>
								:	mt.training_status  
								?	<ClipLoader
										color="#36d7b7"
										loading={true}
										size={20}
									/>
								: 	''
								}
							</div>
						</div>
						{mt.training_status  &&
							<div className="w-full bg-green-200 rounded-lg px-4 text-xs py-1">
								<i>{mt.training_status}</i> 
							</div>
						}
					</div>
				);
			})}
		</div>
	);
};

export default MicroTraining;


/*
CREATE quiz => payload quiz_id
fetch("https://qa.api.pii-protect.com/QuizManagementSystem/quiz-user-revisions/create", {
  "headers": {
    "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6IjkxOGIwNWIxN2M0MmM4ZDRlOWIyNTE4MDU1MGU5NGQ0NGQ0YzlmZDJiMzE0MWQ3ODI2OWU1YmYxYTZlY2VkNDU4M2Y5MTQzMTQ2NGFhNjMyOTAyMTdiNGE2MTQ1ODA5MTlkODQ5NGFmZGNlM2M5Mzg0ZGQ0OWIxYTk3ODIxZDczNDkwYzhhNDNhNTdhNmY4ZWEwMDQzMmE1ZDcyMDFhYWNmNTYxMDY0NDU0NDRmZmJkNTgyZDgxNDllNWE2ODBiYmIwZTE1Y2ZhOTEyODk5NTcxYWQ4NDlkNzA1NDE3NTFlYjA2NjQ5NzYxOWUwYTZmMDQ5ODEwZDc5ODA5M2IxMjAzNzg0NTMxZDEwNjY4YTFjMWY3YmI2ZjUxMTUyNTA3ZWFhZjkxNjcyNzhiYzFiNmMzOTg0MzIzNWRjZjg0MjkwYmNmYWU1MTdlZmVkOTYyNGNlZTQwZjQzNzhhZWI3MzViMWU3YThlZTAyN2I2ZDljYjI2ZjM2NDk4ZDk4ZGU3Mzg0MjAyZDE0OTVlNWRhNTg1YjdhYzYwYTkxOGFhMWJkYjBiZjQ5YTAzMGYzZjFmY2QxZTFiOWE5ZDNhOTFlYmU4ZjkyNTU4MDg4NGM5OTVkODMyNTBmNDJlZjIzODU1ZDY4YTc0Yzk5NTZlZjVlMzZiYjhjOTI2MWM3YzIzMjRiNjhkNWM3OTkyYzA5NGZlNjdiYTVkYzFjMjQ2YjdiOTQ0MzMzYTcyYzI1ODdhN2U0NmQ3OGMyNjM0MjljZjFlOGViNTI5MjI1MDNjMmNlZGRjYmQxZTY4NzY5NjgzZTgwOWVmZmZjNzFmNTM5ZDIxMjZjZDczNWU0NWFiZWQ3MWQxMjg5Y2NlOTZhMmEzNDM0YWY0NzUyMDBhNDJmZDdjMSIsInN1YiI6ImZiZjFjZDliLTRmNWItNGI0MS05YmJkLWJiZThhNzQzZGEyNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9OdUtRNDNhc3AiLCJjb2duaXRvOnVzZXJuYW1lIjoiZmJmMWNkOWItNGY1Yi00YjQxLTliYmQtYmJlOGE3NDNkYTI0IiwiYXVkIjoiN3JwaWFqcHR2MGh2cTEwbmM3djhka2Z2bm8iLCJldmVudF9pZCI6IjIwYmM1NDRmLWRlZWMtNGFkOS04MzIzLThmZTA0MDM3MjA5OSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzc5OTA1NzAwLCJleHAiOjE3Nzk5MDkzMDAsImlhdCI6MTc3OTkwNTcwMSwiZW1haWwiOiJhZG1pbkAxNDIuY29tIn0.NlWtEiI5udYz0mKT3M3nZm6948jZ18RdYfXYmm7ZRqm3iWJ2eEaN4TmpfpW94_WMMS9_hliwPzVxZ52a56sX66l8OTva8aq8lMhaJ0wGfI4Ilq1esK51k2BYDzmn4agwT2ZWQEps-uPiJA6wJePGHeqZ4__5wyFm6RW10hX6CxuYFUOHyGkZ6M7xgG4urxvWMTxMcmuBb-oS1Uz6HDujHmFDNpW7jg-7N0jFPL608oZHDp2TZG08AnwtqyhsJ21y9Ng--n9hrYfEc7xUY_41DrpMaNCsrP_3z1YcX77N62B9opjQECNn5GN0Zaaza8UoN4Ckisfe3wnymYIJf-OOwQ",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\""
  },
  "referrer": "",
  "body": "{\"quiz_id\":\"VGtSWmVRPT0=\"}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

RESUME quiz => payload revision_id
fetch("https://qa.api.pii-protect.com/QuizManagementSystem/quiz-user-revisions/resume", {
  "headers": {
    "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6IjkxOGIwNWIxN2M0MmM4ZDRlOWIyNTE4MDU1MGU5NGQ0NGQ0YzlmZDJiMzE0MWQ3ODI2OWU1YmYxYTZlY2VkNDU4M2Y5MTQzMTQ2NGFhNjMyOTAyMTdiNGE2MTQ1ODA5MTlkODQ5NGFmZGNlM2M5Mzg0ZGQ0OWIxYTk3ODIxZDczNDkwYzhhNDNhNTdhNmY4ZWEwMDQzMmE1ZDcyMDFhYWNmNTYxMDY0NDU0NDRmZmJkNTgyZDgxNDllNWE2ODBiYmIwZTE1Y2ZhOTEyODk5NTcxYWQ4NDlkNzA1NDE3NTFlYjA2NjQ5NzYxOWUwYTZmMDQ5ODEwZDc5ODA5M2IxMjAzNzg0NTMxZDEwNjY4YTFjMWY3YmI2ZjUxMTUyNTA3ZWFhZjkxNjcyNzhiYzFiNmMzOTg0MzIzNWRjZjg0MjkwYmNmYWU1MTdlZmVkOTYyNGNlZTQwZjQzNzhhZWI3MzViMWU3YThlZTAyN2I2ZDljYjI2ZjM2NDk4ZDk4ZGU3Mzg0MjAyZDE0OTVlNWRhNTg1YjdhYzYwYTkxOGFhMWJkYjBiZjQ5YTAzMGYzZjFmY2QxZTFiOWE5ZDNhOTFlYmU4ZjkyNTU4MDg4NGM5OTVkODMyNTBmNDJlZjIzODU1ZDY4YTc0Yzk5NTZlZjVlMzZiYjhjOTI2MWM3YzIzMjRiNjhkNWM3OTkyYzA5NGZlNjdiYTVkYzFjMjQ2YjdiOTQ0MzMzYTcyYzI1ODdhN2U0NmQ3OGMyNjM0MjljZjFlOGViNTI5MjI1MDNjMmNlZGRjYmQxZTY4NzY5NjgzZTgwOWVmZmZjNzFmNTM5ZDIxMjZjZDczNWU0NWFiZWQ3MWQxMjg5Y2NlOTZhMmEzNDM0YWY0NzUyMDBhNDJmZDdjMSIsInN1YiI6ImZiZjFjZDliLTRmNWItNGI0MS05YmJkLWJiZThhNzQzZGEyNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9OdUtRNDNhc3AiLCJjb2duaXRvOnVzZXJuYW1lIjoiZmJmMWNkOWItNGY1Yi00YjQxLTliYmQtYmJlOGE3NDNkYTI0IiwiYXVkIjoiN3JwaWFqcHR2MGh2cTEwbmM3djhka2Z2bm8iLCJldmVudF9pZCI6IjIwYmM1NDRmLWRlZWMtNGFkOS04MzIzLThmZTA0MDM3MjA5OSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzc5OTA1NzAwLCJleHAiOjE3Nzk5MDkzMDAsImlhdCI6MTc3OTkwNTcwMSwiZW1haWwiOiJhZG1pbkAxNDIuY29tIn0.NlWtEiI5udYz0mKT3M3nZm6948jZ18RdYfXYmm7ZRqm3iWJ2eEaN4TmpfpW94_WMMS9_hliwPzVxZ52a56sX66l8OTva8aq8lMhaJ0wGfI4Ilq1esK51k2BYDzmn4agwT2ZWQEps-uPiJA6wJePGHeqZ4__5wyFm6RW10hX6CxuYFUOHyGkZ6M7xgG4urxvWMTxMcmuBb-oS1Uz6HDujHmFDNpW7jg-7N0jFPL608oZHDp2TZG08AnwtqyhsJ21y9Ng--n9hrYfEc7xUY_41DrpMaNCsrP_3z1YcX77N62B9opjQECNn5GN0Zaaza8UoN4Ckisfe3wnymYIJf-OOwQ",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\""
  },
  "referrer": "",
  "body": "{\"revision_id\":\"VFhwbmVFMVVWVEU9\"}",
  "method": "POST"
});

GET ANSWER KEYS quiz
fetch("https://qa.api.pii-protect.com/QuizManagementSystem/quizzes-questions/quiz/VG5wTmVBPT0=/question-answers", {
  "headers": {
    "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6IjkxOGIwNWIxN2M0MmM4ZDRlOWIyNTE4MDU1MGU5NGQ0NGQ0YzlmZDJiMzE0MWQ3ODI2OWU1YmYxYTZlY2VkNDU4M2Y5MTQzMTQ2NGFhNjMyOTAyMTdiNGE2MTQ1ODA5MTlkODQ5NGFmZGNlM2M5Mzg0ZGQ0OWIxYTk3ODIxZDczNDkwYzhhNDNhNTdhNmY4ZWEwMDQzMmE1ZDcyMDFhYWNmNTYxMDY0NDU0NDRmZmJkNTgyZDgxNDllNWE2ODBiYmIwZTE1Y2ZhOTEyODk5NTcxYWQ4NDlkNzA1NDE3NTFlYjA2NjQ5NzYxOWUwYTZmMDQ5ODEwZDc5ODA5M2IxMjAzNzg0NTMxZDEwNjY4YTFjMWY3YmI2ZjUxMTUyNTA3ZWFhZjkxNjcyNzhiYzFiNmMzOTg0MzIzNWRjZjg0MjkwYmNmYWU1MTdlZmVkOTYyNGNlZTQwZjQzNzhhZWI3MzViMWU3YThlZTAyN2I2ZDljYjI2ZjM2NDk4ZDk4ZGU3Mzg0MjAyZDE0OTVlNWRhNTg1YjdhYzYwYTkxOGFhMWJkYjBiZjQ5YTAzMGYzZjFmY2QxZTFiOWE5ZDNhOTFlYmU4ZjkyNTU4MDg4NGM5OTVkODMyNTBmNDJlZjIzODU1ZDY4YTc0Yzk5NTZlZjVlMzZiYjhjOTI2MWM3YzIzMjRiNjhkNWM3OTkyYzA5NGZlNjdiYTVkYzFjMjQ2YjdiOTQ0MzMzYTcyYzI1ODdhN2U0NmQ3OGMyNjM0MjljZjFlOGViNTI5MjI1MDNjMmNlZGRjYmQxZTY4NzY5NjgzZTgwOWVmZmZjNzFmNTM5ZDIxMjZjZDczNWU0NWFiZWQ3MWQxMjg5Y2NlOTZhMmEzNDM0YWY0NzUyMDBhNDJmZDdjMSIsInN1YiI6ImZiZjFjZDliLTRmNWItNGI0MS05YmJkLWJiZThhNzQzZGEyNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9OdUtRNDNhc3AiLCJjb2duaXRvOnVzZXJuYW1lIjoiZmJmMWNkOWItNGY1Yi00YjQxLTliYmQtYmJlOGE3NDNkYTI0IiwiYXVkIjoiN3JwaWFqcHR2MGh2cTEwbmM3djhka2Z2bm8iLCJldmVudF9pZCI6IjIwYmM1NDRmLWRlZWMtNGFkOS04MzIzLThmZTA0MDM3MjA5OSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzc5OTA1NzAwLCJleHAiOjE3Nzk5MDkzMDAsImlhdCI6MTc3OTkwNTcwMSwiZW1haWwiOiJhZG1pbkAxNDIuY29tIn0.NlWtEiI5udYz0mKT3M3nZm6948jZ18RdYfXYmm7ZRqm3iWJ2eEaN4TmpfpW94_WMMS9_hliwPzVxZ52a56sX66l8OTva8aq8lMhaJ0wGfI4Ilq1esK51k2BYDzmn4agwT2ZWQEps-uPiJA6wJePGHeqZ4__5wyFm6RW10hX6CxuYFUOHyGkZ6M7xgG4urxvWMTxMcmuBb-oS1Uz6HDujHmFDNpW7jg-7N0jFPL608oZHDp2TZG08AnwtqyhsJ21y9Ng--n9hrYfEc7xUY_41DrpMaNCsrP_3z1YcX77N62B9opjQECNn5GN0Zaaza8UoN4Ckisfe3wnymYIJf-OOwQ",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\""
  },
  "referrer": "",
  "body": null,
  "method": "GET"
});

sample response
{
	"answers": [
		{
			"answer": "True",
			"id": "VG5wQk5VMVJQVDA9",
			"is_correct": 0
		},
		{
			"answer": "False",
			"id": "VG5wQk5VMW5QVDA9",
			"is_correct": 1
		}
	],
	"category_id": null,
	"category_name": null,
	"category_question_number": null,
	"category_rank": null,
	"correct_feedback": "",
	"incorrect_feedback": "",
	"question_id": "VFdwak1FMW5QVDA9",
	"question_info": null,
	"question_number": 1,
	"text": "Q"
},

END quiz => payload revision_id
fetch("https://qa.api.pii-protect.com/QuizManagementSystem/quiz-user-revisions/end-quiz", {
  "headers": {
    "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6IjkxOGIwNWIxN2M0MmM4ZDRlOWIyNTE4MDU1MGU5NGQ0NGQ0YzlmZDJiMzE0MWQ3ODI2OWU1YmYxYTZlY2VkNDU4M2Y5MTQzMTQ2NGFhNjMyOTAyMTdiNGE2MTQ1ODA5MTlkODQ5NGFmZGNlM2M5Mzg0ZGQ0OWIxYTk3ODIxZDczNDkwYzhhNDNhNTdhNmY4ZWEwMDQzMmE1ZDcyMDFhYWNmNTYxMDY0NDU0NDRmZmJkNTgyZDgxNDllNWE2ODBiYmIwZTE1Y2ZhOTEyODk5NTcxYWQ4NDlkNzA1NDE3NTFlYjA2NjQ5NzYxOWUwYTZmMDQ5ODEwZDc5ODA5M2IxMjAzNzg0NTMxZDEwNjY4YTFjMWY3YmI2ZjUxMTUyNTA3ZWFhZjkxNjcyNzhiYzFiNmMzOTg0MzIzNWRjZjg0MjkwYmNmYWU1MTdlZmVkOTYyNGNlZTQwZjQzNzhhZWI3MzViMWU3YThlZTAyN2I2ZDljYjI2ZjM2NDk4ZDk4ZGU3Mzg0MjAyZDE0OTVlNWRhNTg1YjdhYzYwYTkxOGFhMWJkYjBiZjQ5YTAzMGYzZjFmY2QxZTFiOWE5ZDNhOTFlYmU4ZjkyNTU4MDg4NGM5OTVkODMyNTBmNDJlZjIzODU1ZDY4YTc0Yzk5NTZlZjVlMzZiYjhjOTI2MWM3YzIzMjRiNjhkNWM3OTkyYzA5NGZlNjdiYTVkYzFjMjQ2YjdiOTQ0MzMzYTcyYzI1ODdhN2U0NmQ3OGMyNjM0MjljZjFlOGViNTI5MjI1MDNjMmNlZGRjYmQxZTY4NzY5NjgzZTgwOWVmZmZjNzFmNTM5ZDIxMjZjZDczNWU0NWFiZWQ3MWQxMjg5Y2NlOTZhMmEzNDM0YWY0NzUyMDBhNDJmZDdjMSIsInN1YiI6ImZiZjFjZDliLTRmNWItNGI0MS05YmJkLWJiZThhNzQzZGEyNCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9OdUtRNDNhc3AiLCJjb2duaXRvOnVzZXJuYW1lIjoiZmJmMWNkOWItNGY1Yi00YjQxLTliYmQtYmJlOGE3NDNkYTI0IiwiYXVkIjoiN3JwaWFqcHR2MGh2cTEwbmM3djhka2Z2bm8iLCJldmVudF9pZCI6IjIwYmM1NDRmLWRlZWMtNGFkOS04MzIzLThmZTA0MDM3MjA5OSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzc5OTA1NzAwLCJleHAiOjE3Nzk5MTIxNTQsImlhdCI6MTc3OTkwODU1NCwiZW1haWwiOiJhZG1pbkAxNDIuY29tIn0.i74soJbWzsd7ur8yPVYiHoElHi8I1DR6ZqXy7yFq-i-TTm24gZRYYaCNZhvXJ_KgXiOfkmVRONw3wiOaVYNSHFeamJbZd1smTlgooYS695kpNmY4iIQQqmrrCCQ7G0Wm3-Z3JoQvf__rYSGGaNrmOGyfbGN1IZQK00wmgJsuny_8UYUaPSqs7gfolHGRGNrkKvABTPCfOsCKtrSy30sX7npRw2S_5-5YoqvLOpnTsWh5aOhI1d4rkiThoQ2gvqw4xfU8FqxaN8Gu6Uk2c75B8YS84Foa7_dlQZ0KQ53FUu5GNBYcUmhnEAcQwQ-YRTnInMoKdhq-1k2ZQf2q6siKWw",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\""
  },
  "referrer": "",
  "body": "{\"revision_id\":\"VFhwak5VMUVVVEE9\"}",
  "method": "POST"
});




[
    {
        "mt_id": "VDFSQk13PT0=", 907
        "micro_training": "nm1",
        "published_date": "2026-05-21",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VFZSSk0wMTNQVDA9",
        "micro_training": "Micro Training Time!",
        "published_date": "2026-04-23",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VDBSTk1BPT0=",
        "micro_training": "Brute Force Attacks",
        "published_date": "2020-07-23",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VG5wbk1nPT0=",
        "micro_training": "Erasing A Hard Drive",
        "published_date": "2019-05-23",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VG5wWk13PT0=",
        "micro_training": "Cyber Holiday Shopping Tips",
        "published_date": "2018-11-22",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VG5wWk1nPT0=",
        "micro_training": "Tech Support Scams",
        "published_date": "2018-11-15",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VG5wWk1RPT0=",
        "micro_training": "Create Strong Passwords",
        "published_date": "2018-11-08",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    },
    {
        "mt_id": "VG1wck5RPT0=",
        "micro_training": "Phone Scams at Work",
        "published_date": "2016-08-18",
        "score": null,
        "date_taken": null,
        "user_id": "VGtSRk1FMUVUVFU9"
    }
]
*/
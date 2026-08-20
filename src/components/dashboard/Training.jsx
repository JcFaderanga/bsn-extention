import React, { useMemo, useState } from "react";
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";
import { ClipLoader } from "react-spinners";
import env from "../../utils/useEviroment";
import { RxReload } from "react-icons/rx";

const Training = () => {
const [email, setEmail] = useState("");
const [userToken, setUserToken] = useState("");
const [trainingList, setTrainingList] = useState(null);
const [selectedTrainings, setSelectedTrainings] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [isAutoSubmit, setIsAutoSubmit] = useState(false);
const [filters, setFilters] = useState({
extraCredit: false,
impactESS: false,
});

  	const request = new COMMON_REQUEST();
	const BASE_URL = `https://${env()}.api.pii-protect.com`;

  // =========================
  // FETCH DATA
  // =========================
	async function fetchTraining() {
		setLoading(true);
		setError(null);
		setTrainingList(null);
		setSelectedTrainings([]);
		setFilters({ extraCredit: false, impactESS: false });

		try {
			const {success, error, data} = await request.getUserDataByLogin(email);

			if (!success) {
				setError(error);
				return;
			}

			const userIdToken = data?.AuthenticationResult?.IdToken;
			setUserToken(userIdToken);

			const { success: training_success, error: training_error, data: training_data, status: training_status } = await Request("GET", {
				url: `${BASE_URL}/TestAuthoringSystem/training/v2/users-trainings?training_type=training`,
				authorization: userIdToken,
			});

			if (!training_success) {
				setError(
					training_error || `Status ${training_status}: Failed to fetch trainings`
				);
				return;
			}

		setTrainingList(training_data?.trainings || []);
		} catch (err) {
		setError(err?.message || "Unexpected error");
		} finally {
		setLoading(false);
		}
	}

	// =========================
	// FILTERED LIST
	// =========================
	const filteredMTList = useMemo(() => {
		if (!trainingList) return [];

		return trainingList.filter((t) => {
			//if (t.score !== null) return false;

			const noFilters = !filters.extraCredit && !filters.impactESS;

			if (noFilters) return true;

			const matchExtra =
				filters.extraCredit && t.impacts_ess === "Extra Credit";

			const matchESS =
				filters.impactESS && t.impacts_ess === "Yes";

			return matchExtra || matchESS;
		});
	}, [trainingList, filters]);

	// =========================
	// TOGGLE SINGLE
	// =========================
	function toggleMT(t) {
		//if (t.score !== null) return;

		setSelectedTrainings((prev) =>
		prev.includes(t.quiz_id)
			? prev.filter((id) => id !== t.quiz_id)
			: [...prev, t.quiz_id]
		);
	}

	// =========================
	// FILTER TOGGLES
	// =========================
	function handleExtraCredit() {
		setSelectedTrainings([]);
		setFilters((prev) => ({
		...prev,
		extraCredit: !prev.extraCredit,
		}));
	}

	function handleImpactESS() {
		setSelectedTrainings([]);
		setFilters((prev) => ({
		...prev,
		impactESS: !prev.impactESS,
		}));
	}

	// =========================
	// SELECT ALL VISIBLE
	// =========================
	const isAllVisibleSelected =
		filteredMTList.length > 0 &&
		filteredMTList.every((t) =>
		selectedTrainings.includes(t.quiz_id)
		);

	function handleSelectAll() {
		if (isAllVisibleSelected) {
		setSelectedTrainings([]);
		} else {
		setSelectedTrainings(
			filteredMTList.map((t) => t.quiz_id)
		);
		}
	}

	// =========================
	// SUBMIT PROCESS
	// =========================
	const getOrCreateRevision = async (quiz_id, token = userToken) => {

		async function getRevisionId (){
			const { data, error, status, success } = await Request('GET',{
				url: `${BASE_URL}/QuizManagementSystem/quiz-user-state/quiz/${quiz_id}`,
				authorization: token
			});

			if(!success){
				return {
					success: false,
					error: `Status ${status}: ${error}`
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
				setError(`Status ${status}: ${error}`)
				return;
			}
			console.log("resumeQuiz =>", data)
			if (!data.revision_id || !data.questions) {
				setError(`Status ${status}: Invalid quiz session`)
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
	
	const handleAnswerAllSelected = async () => {

		const handleProgressLog = (quiz_id, log)=>{
			const findTraining = trainingList.find(t => t.quiz_id === quiz_id)
			console.log("selected Training", findTraining )

			setTrainingList((prev) =>
				prev.map((t) =>
				t.quiz_id === quiz_id
					? { ...t, training_status: log }
					: t
			))
		}

		const handleUpdateScore = (quiz_id, score)=>{
			const findTraining = trainingList.find(t => t.quiz_id === quiz_id)
			console.log("selected Training", findTraining )

			setTrainingList((prev) =>
				prev.map((t) =>
				t.quiz_id === quiz_id
					? { ...t, score: score }
					: t
			))
		}

		async function quizAnswerKeys(quiz_id){
			const { 
				data,
				error, 
				success 
			} = await Request('GET',{
				url: `${BASE_URL}/QuizManagementSystem/quizzes-questions/quiz/${quiz_id}/question-answers`,
				authorization: 'Admin'
			});

			if(!success) {
				setError(error)
				return;
			}

			return data;
		}

		async function endingQuiz(quiz_id, revision_id){
			const { 
				data,
				error, 
				success 
			} = await Request('POST',{
				url: `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/end-quiz`,
				authorization: userToken,
				body: { revision_id }
			});

			if(!success) {
				setError(error)
				return;
			}

			return {data,success,error };
		}

		async function submitQuizAnswers(revision_id, quiz_with_answers) {

			const results = await Promise.all(
				quiz_with_answers.map(async (q) => {
					const answer_id = q.correct_answer_id

					if (!answer_id) return false;

					const { data, error, status, success } = await Request('POST',{
						url: `${BASE_URL}/QuizManagementSystem/quiz-user-answer/answer-question/${revision_id}/${q.question_id}`,
						authorization: userToken,
						body: { answer_id:answer_id }
					});

					if(!success){
						setError(error)
						return;
					}

					// console.log(
					// 	success
					// 		? `${q.isCorrect ? '✅' : '❌'} ${q.text}`
					// 		: `⚠️ Failed: ${q.text}`
					// );

					return {
						data: {
							question_id: q.question_id, 
							desription: q.text,
						},
						success
					};
				})
        	);
			return results;
		}

		function mergeQuestionAnswers(questions, answers){
			const mergeQuizAnswers = answers.questions
				.filter(q =>
					questions.some(x => x.question_id === q.question_id)
				)
				.map(q => {
					const correct = q.answers.find(a => a.is_correct === 1);

					const wrongList = q.answers.filter(a => a.is_correct === 0);
					const randomWrong =
						wrongList[Math.floor(Math.random() * wrongList.length)];

					return {
						question_id: q.question_id,
						correct_answer_id: correct?.id,
						wrong_answer_id: randomWrong?.id,
						text: q.text
					};
				});
			return mergeQuizAnswers;
		}


		await Promise.all(
			selectedTrainings.map(async(quiz_id)=>{
				
				handleProgressLog(quiz_id, 'Getting quiz questions...') 
				const { success:quiz_success, revision_id, quiz_questions } = await getOrCreateRevision(quiz_id);
				if(quiz_success){
					handleProgressLog(quiz_id, 'Getting quiz answers...') 
				} 
 
				const quiz_answer_keys = await quizAnswerKeys(quiz_id);
				if(quiz_answer_keys){
					handleProgressLog(quiz_id, 'Preparing to submit...')
				} 

				const quiz_with_answers = mergeQuestionAnswers(quiz_questions, quiz_answer_keys)
				if(quiz_with_answers){ 
					handleProgressLog(quiz_id, 'Finalizing quiz answer...')
				}

				const results = await submitQuizAnswers(revision_id, quiz_with_answers)
				if(results && isAutoSubmit){
					handleProgressLog(quiz_id, 'Submitting Answers...')
				} else {
					handleProgressLog(quiz_id, '✅ Answers are ready. You can submit training manually.')
				}
				
				if(isAutoSubmit){
					const {data, success: end_success} = await endingQuiz(quiz_id, revision_id)
					if(results){
						handleProgressLog(quiz_id, 'Quiz Ended...')
					}
					if(end_success){
						handleUpdateScore(quiz_id, data.score)
					}
				}
				
				// console.log(quiz_id, data)
				// console.log(quiz_id, quiz_answer_keys)
				// console.log('quiz_with_answers', quiz_with_answers)
				// console.log('results', results)
			})
		);
	};

return (
	<div className="p-4">

		{/* INPUT */}
		<div className="flex flex-col gap-2 py-2">
			<Input
				type="email"
				value={email}
				onChange={setEmail}
				placeholder="Enter email"
			/>

			<Button
				title="Get Trainings"
				onClick={fetchTraining}
				loading={loading}
				disabled={!email || loading}
			/>
		</div>

		{/* FILTERS */}
		{trainingList?.length > 0 && (
			<>
				<div className="flex gap-2">
					{/* EXTRA CREDIT */}
					<label className="flex items-center gap-1">
						<input
						type="checkbox"
						checked={filters.extraCredit}
						onChange={handleExtraCredit}
						/>
						Extra Credit
					</label>

					{/* IMPACT ESS */}
					<label className="flex items-center gap-1">
						<input
						type="checkbox"
						checked={filters.impactESS}
						onChange={handleImpactESS}
						/>
						Impact ESS
					</label>
				</div>

				<div className="flex gap-2 justify-between py-2 mt-2 flex-wrap">
					{/* SELECT ALL */}
					<label className="flex items-center gap-1">
						<input
						type="checkbox"
						checked={isAllVisibleSelected}
						onChange={handleSelectAll}
						/>
						Select All
					</label>
					
					{/* ACTION */}
					{selectedTrainings.length > 0 && (
						<div className="flex gap-1 flex-wrap">
							<button
							onClick={handleAnswerAllSelected}
							className="text-sm border bg-slate-200 px-4 py-0.5 rounded-lg"
							>
								Answer all ({selectedTrainings.length})
							</button>
							<label className="flex items-center gap-1 text-sm">
								<input
									type="checkbox"
									checked={isAutoSubmit}
									onChange={()=>setIsAutoSubmit(!isAutoSubmit)}
								/>
								Auto Submit
							</label>
						</div>
					)}
				</div>
			</>
		)}

		{/* ERROR */}
		{error && (
		<p className="text-red-500 p-2 border border-red-300 bg-red-50 rounded">
			{error}
		</p>
		)}

		{/* LIST */}
		{filteredMTList.map((t) => {
			const isChecked = selectedTrainings.includes(t.quiz_id);
			const score = t.score !== null 
			? `${t.score}%` 
			: "";

			const scoreClass = t.score !== null ? (t.score >= 80 ? "text-green-500" : "text-red-500") : "";
			return (
				<div key={t.quiz_id} className="border border-gray-300 rounded-lg my-1 px-4 py-2 ">
					<div className="flex justify-between">
						<div className="flex gap-2 items-center">

						
									<input
										type="checkbox"
										checked={isChecked}
										className="cursor-pointer"
										onChange={() => toggleMT(t)}
									/>
								

							<p>{t.impacts_ess !== "No" && "⭐️"} {t.training_name}</p>
						</div>
						<div className="flex gap-2 items-center">
							<p className={`text-md ${scoreClass} ${score ? '' : ''}`}>{score}</p>
						{
							t.training_status &&
							<ClipLoader
								color="#36d7b7"
								loading={true}
								size={20}
							/>
						}
						</div>
						
					</div>
					{t.training_status &&
						<div className="w-full bg-green-200 rounded-lg px-4 text-xs py-1">
							<i>{t.training_status}</i>
						</div>
					}
				</div>
			);
		})}

	</div>
)};

export default Training;
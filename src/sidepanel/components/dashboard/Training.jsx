import React, { useState } from 'react';
import { IoIosCheckmarkCircle } from "react-icons/io";

const Input = (props) => {
    return (
        <input
            className="bg-white w-full px-4 py-2 rounded-xl border border-gray-300 focus:bg-white focus:ring-2 focus:ring-black/80 outline-none transition"
            type={props.type || 'text'}
            value={props.value || ''}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
        />
    );
};

const Training = () => {
    const [email, setEmail] = useState('');
    const [trainingName, setTrainingName] = useState('');
    const [quizFinished, setQuizFinished] = useState(0);

    const [steps, setSteps] = useState([
        { label: 'Creating token', status: 'idle' },
        { label: 'Getting quiz', status: 'idle' },
        { label: 'Preparing quiz', status: 'idle' },
        { label: 'Fetching answers', status: 'idle' },
        { label: 'Answering questions', status: 'idle' },
        { label: 'Finalizing', status: 'idle' },
    ]);

    const [currentStep, setCurrentStep] = useState(-1);

    const correct_count = 20;

    const BASE_URL = "https://qa.api.pii-protect.com";

    const HEADER = {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://qa-portal.breachsecurenow.com"
    };

    const updateStepStatus = (index, status) => {
        setSteps(prev =>
            prev.map((s, i) =>
                i === index ? { ...s, status } : s
            )
        );
    };

    const runStep = async (index, fn) => {
        setCurrentStep(index);
        updateStepStatus(index, 'active');

        const result = await fn();

        updateStepStatus(index, 'done');
        return result;
    };

    const Request = async (endpoint, token, method = 'GET', body) => {
        const res = await fetch(endpoint, {
            method,
            headers: {
                ...HEADER,
                Authorization: token
            },
            body: body ? JSON.stringify(body) : undefined
        });

        const text = await res.text();

        return {
            status: res.status,
            data: text ? JSON.parse(text) : null
        };
    };

    const ENDPOINTS = {
        searchTraining: (name) =>
            `${BASE_URL}/TestAuthoringSystem/admin/trainings/?limit=25&offset=0&name=${name.trim().replace(/\s+/g, "+")}&order_by=training_details&sort_direction=desc`,

        quizRevisionId: (quiz_id) =>
            `${BASE_URL}/QuizManagementSystem/quiz-user-state/quiz/${quiz_id}`,

        quizQuestionAnswers: (quiz_id) =>
            `${BASE_URL}/QuizManagementSystem/quizzes-questions/quiz/${quiz_id}/question-answers`,

        setQuizAnswer: (revision_id, question_id) =>
            `${BASE_URL}/QuizManagementSystem/quiz-user-answer/answer-question/${revision_id}/${question_id}`,

        resumeQuiz: () =>
            `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/resume`,

        createQuiz: () =>
            `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/create`,

        endQuiz: () =>
            `${BASE_URL}/QuizManagementSystem/quiz-user-revisions/end-quiz`
    };

    const AnswerQuiz = async () => {
        try {
            setQuizFinished(0);

            setCurrentStep(-1);
            setSteps(prev => prev.map(s => ({ ...s, status: 'idle' })));

            // 1. Token
            const token = await runStep(0, async () => {
                const res = await fetch(`${BASE_URL}/cognitomiddlewares/user/login`, {
                    method: "POST",
                    headers: HEADER,
                    body: JSON.stringify({ email, password: 'Working@@123' })
                });

                const data = await res.json();
                const token = data?.AuthenticationResult?.IdToken;

                if (!token) throw new Error('Login failed');
                return token;
            });

            // 2. Quiz ID
            const quiz_id = await runStep(1, async () => {
                const { data } = await Request(
                    ENDPOINTS.searchTraining(trainingName),
                    token
                );
                const activeTraining = data?.trainings?.find(
                    (training) => training.training_active === 1
                );

                const id = activeTraining?.quiz_id;
                if (!id) throw new Error('Quiz not found');

                return id;
            });

            // 3. Revision
            const { revision_id, quiz_questions } = await runStep(2, async () => {
                const res = await Request(
                    ENDPOINTS.quizRevisionId(quiz_id),
                    token
                );

                if (res.status === 200 && res.data?.info?.revision_id) {
                    const { data } = await Request(
                        ENDPOINTS.resumeQuiz(),
                        token,
                        'POST',
                        { revision_id: res.data.info.revision_id }
                    );

                    return {
                        revision_id: data.revision_id,
                        quiz_questions: data.questions
                    };
                }

                const { data } = await Request(
                    ENDPOINTS.createQuiz(),
                    token,
                    'POST',
                    { quiz_id }
                );

                return {
                    revision_id: data.revision_id,
                    quiz_questions: data.questions
                };
            });

            // 4. Answers
            const allAnswers = await runStep(3, async () => {
                const { data } = await Request(
                    ENDPOINTS.quizQuestionAnswers(quiz_id),
                    token
                );
                return data;
            });

            // Prepare answers
            const processed = allAnswers.questions
                .filter(q =>
                    quiz_questions.some(x => x.question_id === q.question_id)
                )
                .map(q => {
                    const correct = q.answers.find(a => a.is_correct === 1);
                    const wrongList = q.answers.filter(a => a.is_correct === 0);
                    const randomWrong =
                        wrongList[Math.floor(Math.random() * wrongList.length)];

                    return {
                        question_id: q.question_id,
                        correct_answer_id: correct?.id,
                        wrong_answer_id: randomWrong?.id
                    };
                });

            const shuffled = processed.sort(() => Math.random() - 0.5);
            const safeCorrectCount = Math.min(correct_count, shuffled.length);

            const selected = shuffled.map((q, index) => ({
                question_id: q.question_id,
                answer_id:
                    index < safeCorrectCount
                        ? q.correct_answer_id
                        : q.wrong_answer_id
            }));

            // 5. Answer (parallel)
            await runStep(4, async () => {
                await Promise.all(
                    selected.map(async (q) => {
                        if (!q.answer_id) return false;

                        const { data } = await Request(
                            ENDPOINTS.setQuizAnswer(revision_id, q.question_id),
                            token,
                            'POST',
                            { answer_id: q.answer_id }
                        );

                        const success =
                            data?.msg === 'Answer has been saved successfully';

                        if (success) {
                            setQuizFinished(prev => prev + 1);
                        }

                        return success;
                    })
                );
            });

            // 6. Finalize
            await runStep(5, async () => {
                await Request(
                    ENDPOINTS.endQuiz(),
                    token,
                    'POST',
                    { revision_id }
                );
            });

        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="  flex items-center justify-center">
            <div className="w-full max-w-lg p-6  rounded-2xl space-y-4">

                <h1 className="text-lg font-semibold text-gray-800">
                    Quiz Automation
                </h1>

                <Input value={email} onChange={setEmail} placeholder="Email" />
                <Input value={trainingName} onChange={setTrainingName} placeholder="Training name"/>
                
                {
                    !email || 
                    !trainingName ? (
                        <button
                            disabled={!email || !trainingName}
                            className="w-full py-2 rounded-xl bg-black text-white opacity-25 cursor-not-allowed"
                        >
                            Start
                        </button>
                    ) : 
                        <button
                            onClick={AnswerQuiz}
                            disabled={!email || !trainingName}
                            className="w-full py-2 rounded-xl bg-black text-white hover:opacity-90 transition"
                        >
                            Start
                        </button>
                }
               

                {/* Steps */}
                <ul className="space-y-2 text-sm">
                    {steps.map((step, i) => {
                        if (currentStep === -1 || i > currentStep) return null;

                        return (
                            <li key={i} className="flex justify-between items-center text-gray-800">
                                <span>{step.label}</span>

                                {step.status === 'active' && (
                                    <span className="animate-pulse">...</span>
                                )}

                                {step.status === 'done' && (
                                    <IoIosCheckmarkCircle className="text-green-500 text-xl" />
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Progress */}
                <div className="text-sm text-gray-700 pt-2">
                    {quizFinished}/{correct_count} {quizFinished == correct_count && <strong className='text-green-600'>QUIZ IS DONE!</strong>}
                </div>

            </div>
        </div>
    );
};

export default Training;    
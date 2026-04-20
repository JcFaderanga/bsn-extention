import React, { useState } from 'react'

const Input = (props) =>{

    return(
        <input 
            className='border p-2 my-2 rounded-xl' 
            type={props.type || 'text'}
            value={props.value}
            onChange={(e)=> props.onChange(e.target.value)}
            placeholder={props?.placeholder}
        />
    )
}

const Training = () => {
    const [email, setEmail] = useState(null);
    const [trainingName, setTrainingName] = useState('');
    const [quizFinished, setQuizFinished] = useState(0);

    const correct_count = 20;

    const BASE_URL = "https://qa.api.pii-protect.com";

    const HEADER = {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://qa-portal.breachsecurenow.com"
    };
    const Request = async (endpoint, token, method = 'GET', body) => {
        if (!endpoint) throw new Error('Invalid endpoint');

        const res = await fetch(endpoint, {
            method,
            headers: {
                ...HEADER,
                Authorization: token
            },
            body: body ? JSON.stringify(body) : undefined
        });

        const text = await res.text();

        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            throw new Error(`Invalid JSON from ${endpoint}`);
        }

        return {
            status: res.status,
            data
        };
    };

    const Auth_logger = async (email, password = 'Working@@123') => {
        const res = await fetch(`${BASE_URL}/cognitomiddlewares/user/login`, {
            method: "POST",
            headers: HEADER,
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        const token = data?.AuthenticationResult?.IdToken;

        if (!token) throw new Error('Login failed');

        return token;
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

    const fetchQuizId = async (token) => {
        const { data } = await Request(
            ENDPOINTS.searchTraining(trainingName),
            token
        );

        const quiz_id = data?.trainings?.[0]?.quiz_id;

        if (!quiz_id) throw new Error('Quiz not found');

        return quiz_id;
    };

    const getOrCreateRevision = async (quiz_id, token) => {
        const res = await Request(
            ENDPOINTS.quizRevisionId(quiz_id),
            token
        );

        // Existing revision → resume
        if (res.status === 200 && res.data?.info?.revision_id) {
            const revision_id = res.data.info.revision_id;

            const { data } = await Request(
                ENDPOINTS.resumeQuiz(),
                token,
                'POST',
                { revision_id }
            );

            return {
                revision_id: data.revision_id,
                quiz_questions: data.questions
            };
        }

        // No revision → create
        if (res.status === 204) {
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
        }

        throw new Error(`Unexpected revision response: ${res.status}`);
    };

    const AnswerQuiz = async () => {
        try {
            const token = await Auth_logger(email);
            const quiz_id = await fetchQuizId(token);

            const { revision_id, quiz_questions } =
                await getOrCreateRevision(quiz_id, token);

            if (!revision_id || !quiz_questions) {
                throw new Error('Invalid quiz session');
            }

            const { data: allAnswers } = await Request(
                ENDPOINTS.quizQuestionAnswers(quiz_id),
                token
            );

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
                        wrong_answer_id: randomWrong?.id,
                        text: q.text
                    };
                });

            // Shuffle
            const shuffled = processed.sort(() => Math.random() - 0.5);

            // Clamp correct_count
            const safeCorrectCount = Math.min(correct_count, shuffled.length);

            // Select answers
            const selected = shuffled.map((q, index) => {
                const isCorrect = index < safeCorrectCount;

                return {
                    question_id: q.question_id,
                    answer_id: isCorrect
                        ? q.correct_answer_id
                        : q.wrong_answer_id,
                    text: q.text,
                    isCorrect
                };
            });

            // Submit answers
            const results = await Promise.all(
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

                    success && setQuizFinished(prev => prev + 1)
                    console.log(
                        success
                            ? (`${q.isCorrect ? '✅' : '❌'} ${q.text}`)
                            : `⚠️ Failed: ${q.text}`
                    );

                    return success;
                })
            );

            const successCount = results.filter(Boolean).length;

            console.log(`Answered: ${successCount}/${selected.length}`);
            console.log(`Target Correct: ${safeCorrectCount}`);

            // End quiz
            if (successCount === selected.length) {
                const { data } = await Request(
                    ENDPOINTS.endQuiz(),
                    token,
                    'POST',
                    { revision_id }
                );

                console.log("🎉 QUIZ DONE:", data?.score_level_feedback);
            }

        } catch (err) {
            console.error("❌ Fatal Error:", err.message);
        }
    };

    return (
        <div>
            <div>  
                <Input
                    onChange={(e)=> setEmail(e)}
                    value={email}
                    placeholder={'Enter Email'}
                    type={'email'}
                />
            </div>
            <div>  
                <Input
                    onChange={(e)=> setTrainingName(e)}
                    value={trainingName}
                    placeholder={'Enter Training name'}
                />
            </div>
            <button onClick={()=> AnswerQuiz() } className='border px-5 py-2 rounded-lg bg-green-800 text-white'>Start</button>
            {quizFinished}/20
        </div>
    )
}

export default Training

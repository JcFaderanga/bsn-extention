import React, { useState } from "react";
import { Input, Button } from "../UI";
import { Request } from "../../utils/useAPIRequest";
import env from "../../utils/useEviroment";

const TrainingAnswers = () => {
  const [trainingName, setTrainingName] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [answerKeys, setAnswerKeys] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = `https://${env()}.api.pii-protect.com`;

  async function searchTrainings() {
    setLoading(true);
    setError(null);
    setAnswerKeys(null);

    const encodedTrainingName = trainingName.replaceAll(" ", "+");
    try {
      const { data, error, success } = await Request("GET", {
        url: `${BASE_URL}/TestAuthoringSystem/admin/trainings/?training_type=training&limit=100&offset=0&name=${encodedTrainingName}&order_by=training_details&sort_direction=asc`,
        authorization: "Admin",
      });

      if (!success) {
        setError(error || "No trainings found");
        return null;
      }

      const training = data?.trainings?.[0] || null;
      if (!training) {
        setError("No training found for that name.");
        return null;
      }

      return training;
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching trainings.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuizAnswerKeys(quiz_id) {
    const { data, error, success } = await Request("GET", {
      url: `${BASE_URL}/QuizManagementSystem/quizzes-questions/quiz/${quiz_id}/question-answers`,
      authorization: "Admin",
    });

    if (!success) {
      setError(error || "Unable to fetch quiz answer keys.");
      return null;
    }

    return data;
  }

  async function getAnswerKeys() {
    const training = await searchTrainings();
    if (!training) return;

    const quiz_id = training.quiz_id;
    const trainingAnswerKeys = await fetchQuizAnswerKeys(quiz_id);
    if (!trainingAnswerKeys?.questions) return;

    const answerKeys = trainingAnswerKeys.questions.map((item, index) => {
      const isCorrectAnswer = item.answers?.find((answer) => answer.is_correct);
      return {
        originalIndex: index + 1,
        question: item.text,
        answer: isCorrectAnswer?.answer || "No correct answer found",
      };
    });

    setAnswerKeys(answerKeys);
  }

  const filteredAnswerKeys = answerKeys?.filter((item) =>
    item.question.toLowerCase().includes(questionSearch.toLowerCase())
  );

  return (
        <div className="p-4">

            {/* INPUT */}
            <div className="flex flex-col gap-2 py-2">
                <Input
                    type="text"
                    value={trainingName}
                    onChange={setTrainingName}
                    placeholder="Enter training name"
                />

                <Button
                    title="Search Trainings"
                    onClick={getAnswerKeys}
                    loading={loading}
                    disabled={!trainingName || loading}
                />
            </div>

            {/* ERROR */}
            {error && (
                <p className="text-red-500 p-2 border border-red-300 bg-red-50 rounded">
                    {error}
                </p>
            )}

            {answerKeys && (
                <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <Input
                            type="text"
                            value={questionSearch}
                            onChange={setQuestionSearch}
                            placeholder="Search questions"
                        />
                        {questionSearch && (
                            <p className="text-sm text-gray-600">
                                Searching questions for: <span className="font-semibold">{questionSearch}</span>
                            </p>
                        )}
                    </div>

                    <h2 className="text-lg font-semibold">Answer Keys</h2>
                    <div className="space-y-3">
                        {(filteredAnswerKeys?.length ? filteredAnswerKeys : answerKeys).map((item) => (
                            <div key={item.originalIndex} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <p className="text-sm text-gray-500">Question {item.originalIndex}</p>
                                <p className="mt-2 font-medium text-gray-900">{item.question}</p>
                                <p className="mt-3 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                                    Correct answer: <span className="font-semibold">{item.answer}</span>
                                </p>
                            </div>
                        ))}
                        {questionSearch && filteredAnswerKeys?.length === 0 && (
                            <p className="text-sm text-gray-500">No questions match "{questionSearch}".</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingAnswers;

import React, { useMemo, useState } from "react";
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";

const Training = () => {
  const [email, setEmail] = useState("");
  const [trainingList, setTrainingList] = useState(null);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    extraCredit: false,
    impactESS: false,
  });

  const request = new COMMON_REQUEST();

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
      const user_res = await request.getUserDataByLogin(email);

      if (!user_res?.success) {
        setError(user_res?.error?.message || "Failed to fetch user");
        return;
      }

      const userIdToken =
        user_res?.data?.AuthenticationResult?.IdToken;

      const training_res = await Request("GET", {
        url: `https://qa.api.pii-protect.com/TestAuthoringSystem/training/v2/users-trainings?training_type=training`,
        authorization: userIdToken,
      });

      if (!training_res?.success) {
        setError(
          training_res?.error?.message || "Failed to fetch trainings"
        );
        return;
      }

      setTrainingList(training_res?.data?.trainings || []);
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
      if (t.score !== null) return false;

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
    if (t.score !== null) return;

    setSelectedTrainings((prev) =>
      prev.includes(t.training_id)
        ? prev.filter((id) => id !== t.training_id)
        : [...prev, t.training_id]
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
      selectedTrainings.includes(t.training_id)
    );

  function handleSelectAll() {
    if (isAllVisibleSelected) {
      setSelectedTrainings([]);
    } else {
      setSelectedTrainings(
        filteredMTList.map((t) => t.training_id)
      );
    }
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleAnswerAllSelected() {
    console.log("Selected MTs:", selectedTrainings);
  }

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
          title="Get Micro Trainings"
          onClick={fetchTraining}
          loading={loading}
          disabled={!email || loading}
        />
      </div>

      {/* FILTERS */}
      {trainingList?.length > 0 && (<>
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

        <div className="flex gap-2 justify-between py-2 mt-2">
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
            <div className="flex gap-1">
                <button
                onClick={handleAnswerAllSelected}
                className="text-sm border bg-slate-200 px-4 py-0.5 rounded-lg"
                >
                    Answer all ({selectedTrainings.length})
                </button>
                <label className="flex items-center gap-1 text-sm">
                    <input
                    type="checkbox"
                    />
                    Auto Submit
                </label>
            </div>
    
          )}
        </div>
      </>)}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 p-2 border border-red-300 bg-red-50 rounded">
          {error}
        </p>
      )}

      {/* LIST */}
      {filteredMTList.map((t) => {
        const isChecked = selectedTrainings.includes(t.training_id);

        return (
          <div
            key={t.training_id}
            className="flex justify-between px-4 py-2 border border-gray-300 rounded-lg my-1"
          >
            <div className="flex gap-2 items-center">

              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleMT(t)}
              />

              <p>
                {t.impacts_ess !== "No" && "⭐️"} {t.training_name}
              </p>
            </div>

            <p>{t.score}</p>
          </div>
        );
      })}

    </div>
  );
};

export default Training;
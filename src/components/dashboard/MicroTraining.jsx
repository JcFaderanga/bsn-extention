import React, { useState } from "react";
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";

const MicroTraining = () => {
  const [email, setEmail] = useState("");
  const [MT, setMT] = useState("");
  const [MTList, setMTList] = useState(null);
  const [isSpecificMT, setSpecificMT] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = new COMMON_REQUEST();

  async function fetchTraining() {
    setLoading(true);
    setError(null);
    setMTList(null);

    try {
      // 1. Get user
      const user_res = await request.getUserDataByLogin(email);

      if (!user_res?.success) {
        setError(
          user_res?.error?.description ||
          user_res?.error?.message ||
          "Failed to fetch user"
        );
        return;
      }

      const userId = user_res?.data?.user?.id;
      const userIdToken = user_res?.data?.AuthenticationResult?.IdToken;

    //   if (!userId || !userIdToken) {
    //     setError("Missing user ID or token");
    //     return;
    //   }

      // 2. Get micro trainings
      const mt_res = await Request("GET", {
        url: `https://qa.api.pii-protect.com/TestAuthoringSystem/myDashboard/microTrainings/${userId}?_sort=published_date&_order=DESC`,
        authorization: userIdToken,
      });

      if (!mt_res?.success) {
        setError(`Failed to fetch micro trainings. ${mt_res?.error?.message || mt_res?.error?.description || ""}`);
        return;
      }
 
      setMTList(mt_res?.data || []);
    } catch (err) {
      setError(err?.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
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

        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={isSpecificMT}
            onChange={() => setSpecificMT(!isSpecificMT)} 
          />
          <p>Select specific Micro training</p>
        </div>

        { isSpecificMT &&
        <Input
          value={MT}
          onChange={setMT}
          placeholder="Enter Micro Training here..."
        />
        } 
        {/* Error Display (SAFE) */}
        {error && (
          <p className="text-red-500 w-full text-center border border-red-500 bg-red-50 p-2 rounded-xl">
            {typeof error === "object"
              ? error?.description || error?.message || JSON.stringify(error)
              : error}
          </p>
        )}

        <Button
          title="Find"
          onClick={fetchTraining}
          loading={loading}
          disabled={!email || loading}
        />
      </div>

      {/* Output */}
      {
        MTList?.map((mt)=>{
          return(
            <div key={mt.mt_id} className={`
              ${mt.score !== null && 'opacity-50 cursor-not-allowed'} 
              flex justify-between px-4 py-2 border border-gray-300 rounded-lg my-1`
            }>

              <div className="flex gap-2">
                <input
                  type="checkbox"
                  disabled = {mt.score !== null && true}
                />
                <p>{mt.micro_training}</p>
              </div>
              <p>{mt.score}</p>
            </div>
          )
        })
      }

      {/* <div className="mt-4">
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {MTList
            ? JSON.stringify(MTList, null, 2)
            : "No data loaded yet"}
        </pre>
      </div> */}
    </div>
  );
};

export default MicroTraining;
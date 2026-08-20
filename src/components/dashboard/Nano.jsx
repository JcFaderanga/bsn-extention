import React, {useState} from 'react'
import { Input, Button } from "../UI";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Request } from "../../utils/useAPIRequest";
import env from "../../utils/useEviroment";

const Nano = () => {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [NanoList, setNanoList] = useState(null);
const [userToken, setUserToken] = useState(null);
const [resetting, setResetting] = useState(false);

const request = new COMMON_REQUEST();
const BASE_URL = `https://${env()}.api.pii-protect.com`;

async function fetchNanos() {
    setLoading(true);
    setError(null);
    setNanoList(null);

    try {
        const {success, error, data} = await request.getUserDataByLogin(email);

        if (!success) {
            setError(error);
            return;
        }

        const userIdToken = data?.AuthenticationResult?.IdToken;
        setUserToken(userIdToken);

        const { success: nano_success, error: nano_error, data: nano_data, status: nano_status } = await Request("GET", {
            url: `${BASE_URL}/TestAuthoringSystem/training/v2/users-trainings?limit=100&offset=0&training_type=nano_training`,
            authorization: userIdToken,
        });

        if (!nano_success) {
            setError(
                nano_error || `Status ${nano_status}: Failed to fetch nanos`
            );
            return;
        }

    setNanoList(nano_data?.trainings || []);
    } catch (err) {
    setError(err?.message || "Unexpected error");
    } finally {
    setLoading(false);
    }
}


const resetNanoStatus = async () => {
    const nanosToReset = NanoList?.filter(
        (nano) => nano.completion_status === "completed" && nano.training_id
    ) || [];

    if (!nanosToReset.length) return;

    setResetting(true);
    setError(null);

    try {
        const results = await Promise.all(
            nanosToReset.map((nano) =>
                Request("PUT", {
                    url: `${BASE_URL}/TestAuthoringSystem/training/v2/users-trainings/${nano.training_id}/stats`,
                    authorization: userToken,
                    body: { is_viewed: 0 },
                })
            )
        );

        const failed = results.find((result) => !result.success);
        if (failed) {
            setError(failed.error || "Failed to reset one or more nanos");
            return;
        }

        setNanoList((prev) =>
            prev?.map((nano) =>
                nanosToReset.some((item) => item.training_id === nano.training_id)
                    ? { ...nano, completion_status: "incomplete", is_viewed: 0 }
                    : nano
            ) || prev
        );
    } catch (err) {
        setError(err?.message || "Unexpected error while resetting nanos");
    } finally {
        setResetting(false);
    }
}

return (
    <div className="flex items-center justify-center bg-white">
    <div className="w-full max-w-md p-4">

        {/* Input */}
        <div className="mt-5">
        <Input
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter email address"
        />
        </div>

        {/* Button */}
        <div className="mt-4">
        <Button
            title={"Get Nanos"}
            onClick={fetchNanos}
            loading={loading}
            disabled={!email.trim() || loading}
        />
        </div>

        {error && (
        <p className="mt-4 text-sm text-center text-red-500 border border-red-300 bg-red-50 p-2 rounded-xl">
            {typeof error === "object" ? error?.message || JSON.stringify(error) : error}
        </p>
        )}

        {NanoList?.length > 0 && (
        <div className="mt-5">
            <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-semibold">Nanos ({NanoList.length})</h2>
                <button
                    type="button"
                    onClick={resetNanoStatus}
                    disabled={resetting}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100"
                >
                    {resetting ? "Resetting..." : "Reset All Nano Status"}
                </button>
            </div>

            <div className="space-y-2">
                {NanoList.map((nano, index) => {
                    const nanoName = nano.training_name || `Nano ${index + 1}`;
                    const isComplete = nano.completion_status === "completed";
                    const status = isComplete ? "Viewed" : "Not Viewed";

                    return (
                        <div
                            key={nano.training_id || index}
                            className={`flex items-center justify-between gap-3 p-3 border border-gray-300 rounded-lg ${
                                isComplete ? "bg-green-100" : ""
                            }`}
                        >
                            <span className="truncate">{nanoName}</span>
                            <span className={`text-sm ${isComplete ? "text-green-700" : "text-gray-500"} whitespace-nowrap`}>{status}</span>
                        </div>
                    );
                })}
            </div>
        </div>
        )}

        {NanoList && NanoList.length === 0 && (
        <p className="mt-5 text-sm text-center text-gray-500">No nanos found.</p>
        )}
    </div>
    </div>
);
}

export default Nano

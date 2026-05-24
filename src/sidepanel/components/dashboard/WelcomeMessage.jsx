import React, { useState } from "react";
import { COMMON_REQUEST } from "../../../utils/useCommonAPI";

const WelcomeMessage = () => {
  const request = new COMMON_REQUEST();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const setRecievedWelcomeMessage = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      await request.setWelcomeMessage(email);

      setMessage({
        type: "success",
        text: "Welcome message sent successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-4">

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900">
          Send Welcome Message
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Enter an email to trigger the welcome event
        </p>

        {/* Input */}
        <div className="mt-5">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={setRecievedWelcomeMessage}
          disabled={loading}
          className={`mt-4 w-full py-3 rounded-lg font-medium transition
            ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }
          `}
        >
          {loading ? "Sending..." : "Send Welcome"}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 text-sm p-3 rounded-lg border
              ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }
            `}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
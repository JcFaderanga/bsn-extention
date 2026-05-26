import React, { useState } from "react";
import { COMMON_REQUEST } from "../../utils/useCommonAPI";
import { Input, Button } from "../UI";

const WelcomeMessage = () => {
  const request = new COMMON_REQUEST();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleSendWelcomeMessage = async () => {
    setMessage({ type: "", text: "" });

    // Basic validation
    if (!email.trim()) {
      return setMessage({
        type: "error",
        text: "Email is required.",
      });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      return setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
    }

    try {
      setLoading(true);

      const response = await request.setWelcomeMessage(email);

      if (!response?.success) {
        throw new Error(
          response?.error?.description ||
          response?.error?.message ||
          "Failed to send welcome message."
        );
      }

      setMessage({
        type: "success",
        text: "Welcome message sent successfully!",
      });

      // Optional: clear input after success
      setEmail("");

    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.message ||
          "Something went wrong while sending the welcome message.",
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
          Enter an email to trigger the welcome event.
        </p>

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
            title={loading ? "Sending..." : "Send Welcome"}
            onClick={handleSendWelcomeMessage}
            loading={loading}
            disabled={!email.trim() || loading}
          />
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mt-4 text-sm p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;
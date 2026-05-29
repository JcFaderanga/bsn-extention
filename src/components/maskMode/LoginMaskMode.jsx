import React, { useState } from 'react'
import { Button, Input } from '../UI';
const LoginMaskMode = () => {
const [email, setEmail] = useState('')
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
                    title={false ? "Sending..." : "Send Welcome"}
                    onClick={()=>{}}
                    loading={false}
                    disabled={!email.trim() || false}
                />
                </div>
            </div>
        </div>
    );
}

export default LoginMaskMode

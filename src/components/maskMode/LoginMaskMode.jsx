import React, { useState } from 'react'
import { Button, Input } from '../UI';
import { COMMON_REQUEST } from '../../utils/useCommonAPI';

const request = new COMMON_REQUEST();

const LoginMaskMode = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await request.getUserDataByLogin(email);

      if (error || !data) {
        setError(error || 'User not found');
        return;
      }

      // ✅ always store safe JSON
      localStorage.setItem('maskUserData', JSON.stringify(data));

      onLogin?.(data);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-4">

            <h2 className="text-lg font-semibold text-gray-900">
            Login
            </h2>

            <p className="text-sm text-gray-500 mt-1">
            Enter an email to start masking, 'Working@@123' is the password by default.
            </p>
            <div className="mt-5">
                <Input
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter email address"
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <div className="mt-4">
                <Button
                    title={"Start masking"}
                    onClick={login}
                    loading={loading}
                    disabled={!email.trim() || loading}
                />
            </div>

        </div>
    </div>
  );
}

export default LoginMaskMode;
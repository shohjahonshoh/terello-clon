import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'forgotPasswordUsername') {
      setForgotPasswordUsername(value);
    } else if (name === 'resetToken') {
      setResetToken(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    }
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://95.130.227.110:8000/api/auth/login/', {
        username,
        password,
      });

      if (response.status === 200) {
        const { access, refresh } = response.data; // Retrieve both access and refresh tokens
        localStorage.setItem('access_token', access); // Store access token in localStorage
        localStorage.setItem('refresh_token', refresh); // Store refresh token in localStorage
        console.log('Login Successful:', response.data);

        navigate('/today-challenges'); // Redirect on success
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message); // Improved error handling
    }
  };

  const handleForgotPassword = async () => {
    const refreshToken = localStorage.getItem('refresh_token'); // Get refresh token from localStorage
    if (!refreshToken) {
      setError('No refresh token found. Please log in again.');
      return;
    }

    try {
      // Use refresh token to get new access token if expired
      const response = await axios.post('http://95.130.227.110:8000/api/auth/token/refresh/', {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken); // Store new access token in localStorage

        // Now, make the password reset request
        const passwordResetResponse = await fetch('http://95.130.227.110:8000/api/auth/password_reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newAccessToken}`, // Use new access token for auth
          },
          body: JSON.stringify({ username: forgotPasswordUsername }),
        });

        if (!passwordResetResponse.ok) {
          throw new Error('Password reset failed: ' + passwordResetResponse.statusText);
        }

        const data = await passwordResetResponse.json();
        console.log('SMS sent:', data);
        setSmsSent(true);
        setShowResetPassword(true); // Show reset password form after SMS is sent
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message); // Improved error handling
    }
  };

  const handleResetPassword = async () => {
    const refreshToken = localStorage.getItem('refresh_token'); // Get refresh token from localStorage
    if (!refreshToken) {
      setError('No refresh token found. Please log in again.');
      return;
    }

    try {
      // Use refresh token to get new access token if expired
      const response = await axios.post('http://95.130.227.110:8000/api/auth/token/refresh/', {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken); // Store new access token in localStorage

        // Send the reset token and new password to update the password
        const resetResponse = await fetch('http://95.130.227.110:8000/api/auth/password_reset/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newAccessToken}`, // Use new access token for auth
          },
          body: JSON.stringify({
            token: resetToken,
            password: newPassword,
          }),
        });

        if (!resetResponse.ok) {
          throw new Error('Password reset failed: ' + resetResponse.statusText);
        }

        const data = await resetResponse.json();
        console.log('Password reset successful:', data);
        setError(null);
        alert('Your password has been reset successfully!');
        navigate('/login'); // Redirect to login after successful password reset
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message); // Improved error handling
    }
  };

  const isFormValid = username && password;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl text-center font-bold mb-2">Sign in</h2>
        <p className="text-gray-600 text-center mb-4">
          Nice to meet you! Enter your username and password to login.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="drop-shadow-xl" onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">
            Username:
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="border w-full p-2 rounded-md mb-4"
            value={username}
            onChange={handleChange}
            required
          />

          <label className="block mb-2 text-sm font-medium">
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="border w-full p-2 rounded-md mb-4"
            value={password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className={`w-full py-2 rounded-md ${isFormValid ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={!isFormValid}
          >
            Sign-in
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {showForgotPassword && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              Enter your username to reset password
            </label>
            <input
              type="text"
              name="forgotPasswordUsername"
              placeholder="Enter your username"
              className="border w-full p-2 rounded-md mb-4"
              value={forgotPasswordUsername}
              onChange={handleChange}
              required
            />
            <button
              onClick={handleForgotPassword}
              className="w-full py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Reset Password via SMS
            </button>
            {smsSent && (
              <div className="text-center mt-2 text-green-500">
                Password reset instructions have been sent via SMS.
              </div>
            )}
          </div>
        )}

        {showResetPassword && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              Enter the reset token
            </label>
            <input
              type="text"
              name="resetToken"
              placeholder="Enter your reset token"
              className="border w-full p-2 rounded-md mb-4"
              value={resetToken}
              onChange={handleChange}
              required
            />
            <label className="block mb-2 text-sm font-medium">
              New Password:
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              className="border w-full p-2 rounded-md mb-4"
              value={newPassword}
              onChange={handleChange}
              required
            />
            <button
              onClick={handleResetPassword}
              className="w-full py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

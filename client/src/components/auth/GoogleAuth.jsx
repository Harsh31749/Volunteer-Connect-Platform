import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
<<<<<<< HEAD
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuth = () => {
    const { authenticateGoogleUser } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;

        if (!idToken) {
            alert('Social login failed: Token not found in response.');
            return;
        }

        try {
            // 1. Send the Google ID Token to your server for exchange/verification
            const res = await axios.post('/api/users/google-login', { token: idToken });
            const { token, user } = res.data;

            // 2. Authenticate session: sets token in localStorage/axios headers
            //    Note: Our server already returned the token and user data, 
            //    so we can skip the extra profile load in the context for speed.
            //    Since we modified setAuthSession in AuthContext.js to handle full user data,
            //    we use that to fully initialize the session.
            await authenticateGoogleUser(token, user); // FIX: Passing the user data from the response

            // 3. Redirect based on role (using the fresh user data)
            if (user.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (error) {
            // Improved error messaging
            const msg = error.response?.data?.msg || 'Login failed. Please check your credentials or try again.';
            alert(msg);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                alert('Google Login Failed: There was an error with the login process.');
            }}
        />
    );
};

export default GoogleAuth;
=======
import { useAuth } from '../../context/AuthContext'; // adjust path based on your project structure
import { useNavigate } from 'react-router-dom';

const GoogleAuth = () => {
  const { authenticateGoogleUser } = useAuth(); // your context for handling auth
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      alert('Social login failed: Token not found in response.');
      return;
    }

    try {
      const res = await axios.post('/api/users/google-login', { token: idToken });
      const { token, user } = res.data;

      authenticateGoogleUser(token); // Save token in context/localStorage

      // Redirect based on role
      if (user.role === 'ngo') {
        navigate('/dashboard/ngo');
      } else {
        navigate('/dashboard/volunteer');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert('Google Login Failed')}
    />
  );
};

export default GoogleAuth;
>>>>>>> ad8ffeaf422495bbebab381455c6cd8ece9dc28e

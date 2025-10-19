import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
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

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleAuth = () => {
    const { authenticateGoogleUser } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;

        if (!idToken) {
           toast.error('Social login failed: Token not found in response.');
            return;
        }

        try {
            const res = await axios.post('/api/users/google-login', { token: idToken });
            const { token, user } = res.data;


            await authenticateGoogleUser(token, user);

            if (user.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (error) {
            const msg = error.response?.data?.msg || 'Login failed. Please check your credentials or try again.';
            toast.error(msg);
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                toast.error('Google Login Failed: There was an error with the login process.');
            }}
        />
    );
};

export default GoogleAuth;

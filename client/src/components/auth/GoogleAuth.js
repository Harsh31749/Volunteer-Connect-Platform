import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuth = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (response) => {
        // CRITICAL: response.credential holds the ID token string for verification
        const idToken = response.credential; 

        if (!idToken) {
            return alert('Social login failed: Token not found in response.');
        }

        try {
            // 1. Send the extracted ID Token to YOUR backend API
            const res = await axios.post('/api/users/google-login', {
                token: idToken, 
            });

            // 2. Receive your application's JWT and user data
            const { token, user: userData } = res.data;

            // 3. Update global state and storage
            localStorage.setItem('token', token);
            axios.defaults.headers.common['x-auth-token'] = token;
            setUser(userData); // Update context with fetched user data

            // 4. Redirect based on role
            if (userData.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (error) {
            console.error('Login to backend failed:', error);
            alert('Social login failed. Please ensure GOOGLE_CLIENT_ID and origins are correct.');
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleSuccess,
        onError: (error) => console.log('Google Login Failed:', error),
        scope: 'profile email', 
    });

    return (
        <button
            onClick={() => login()}
            style={{ 
                width: '100%', 
                padding: '10px 0', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                backgroundColor: '#fff',
                fontWeight: 'bold',
                color: '#4285F4',
                cursor: 'pointer'
            }}
        >
            <i className="fab fa-google" style={{marginRight: '8px'}}></i> Sign in with Google
        </button>
    );
};

export default GoogleAuth;
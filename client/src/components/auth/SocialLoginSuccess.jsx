import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import toast from 'react-hot-toast';

const SocialLoginSuccess = () => {
    const { authenticateGoogleUser, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Authenticating...');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            authenticateGoogleUser(token)
                .then(authenticatedUser => {
                    if (authenticatedUser) {
                        setStatus('Login successful. Redirecting...');
                        const userRole = authenticatedUser.role;
                        navigate(userRole === 'ngo' ? '/dashboard/ngo' : '/dashboard/volunteer');
                    } else {
                        // This typically means token was invalid or user profile load failed
                        setStatus('Authentication failed. Redirecting to login...');
                        navigate('/login'); 
                    }
                })
                .catch(err => {
                    console.error('Social Login Error:', err);
                    toast.error('Social Login Error:', err);
                    setStatus('Authentication failed. Redirecting to login...');
                    navigate('/login');
                });
        } else {
            setStatus('Error: Authentication token missing. Redirecting...');
            navigate('/login');
        }
    }, [location.search, navigate, authenticateGoogleUser, user]);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>{status}</h2>
            {status.includes('failed') && <p>If the issue persists, please try standard login or contact support.</p>}
        </div>
    );
};

export default SocialLoginSuccess;
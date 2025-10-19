import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Renamed for clarity, since the decoded object contains the role/id
const isTokenExpired = (decodedToken) => {
    // JWT exp is in seconds, Date.now() is in milliseconds
    if (!decodedToken || !decodedToken.exp) return true;
    return decodedToken.exp * 1000 < Date.now();
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const setAuthSession = (token) => {
        const decodedToken = jwtDecode(token);

        // FIX 1: Check if the token is expired immediately upon decoding
        if (isTokenExpired(decodedToken)) {
            throw new Error('Token expired during session setup.');
        }

        // Session is valid, proceed with setup
        localStorage.setItem('token', token);
        const decodedUser = decodedToken.user;
        setUser(decodedUser);
        axios.defaults.headers.common['x-auth-token'] = token;
        return decodedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setAuthSession(token);
            } catch (error) {
                // Catches token decoding failure OR the new expired token check
                console.error("Session restoration failed:", error.message);
                logout(); // Use the cleaner logout function
            }
        }
        setLoading(false);
    }, []);
    
    // FIX 2: Refactored logic to throw simpler error messages
    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/users/login', { email, password });
            return setAuthSession(res.data.token);
        } catch (err) {
            console.error('Login failed:', err.response?.data?.msg || 'Unknown error');
            throw new Error(err.response?.data?.msg || 'Login failed due to server error.');
        }
    };

    // FIX 2: Refactored logic to throw simpler error messages
    const register = async (formData) => {
        try {
            const res = await axios.post('/api/users/register', formData);
            return setAuthSession(res.data.token);
        } catch (err) {
            console.error('Registration failed:', err.response?.data?.msg || 'Unknown error');
            throw new Error(err.response?.data?.msg || 'Registration failed due to server error.');
        }
    };
    
    // NEW FUNCTION: For Google Auth Component (Fix 3)
    const authenticateGoogleUser = (token) => {
        // Assume Google Auth component fetches the token and passes it here
        try {
            return setAuthSession(token);
        } catch (error) {
            console.error("Google authentication failed:", error.message);
            logout();
            throw new Error('Google authentication failed.');
        }
    };


    const value = {
        user,
        loading,
        login,
        logout,
        register,
        authenticateGoogleUser, // Expose this dedicated function instead of raw setUser
    };

    if (loading) {
        return <div>Loading authentication session...</div>; // Simple loading state for initial load
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
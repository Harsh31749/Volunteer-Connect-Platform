import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const decodeToken = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }

    let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) {
        payload += '=';
    }

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        payload = window.atob(payload);
    } else if (typeof Buffer !== 'undefined') {
        payload = Buffer.from(payload, 'base64').toString();
    } else {
        throw new Error('Base64 decoding environment not supported.');
    }

    return JSON.parse(payload);
};

const isTokenExpired = (decodedToken) => {
    if (!decodedToken || !decodedToken.exp) return true;
    return decodedToken.exp * 1000 < Date.now();
};

const setAuthHeaders = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    // Helper: Fetches the full user profile from the server using the active token
    const loadUserProfile = useCallback(async (token) => {
        try {
            const res = await axios.get('/api/users/profile', {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            return res.data; // Return full user object
        } catch (err) {
            console.error('Failed to load user profile.', err.message);
            toast.error('Failed to load user profile.', err.message);
            logout();
            return null;
        }
    }, [setUser]);
    
    // Core session setter and validation
    const setAuthSession = async (token, userData = null) => {
        const decodedToken = decodeToken(token);

        if (isTokenExpired(decodedToken)) {
            logout();
            throw new Error('Token expired during session setup.');
        }

        setAuthHeaders(token);

        if (userData && userData.role) {
            // Use user data provided directly by login/register response
            setUser(userData);
            return userData;
        } else {
            // Token from local storage or OAuth redirect needs profile fetching
            const profile = await loadUserProfile(token);
            if (!profile) throw new Error("Failed to authenticate session.");
            return profile;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            (async () => {
                try {
                    setAuthHeaders(token); 
                    const decodedToken = decodeToken(token);

                    if (isTokenExpired(decodedToken)) {
                        console.error("Token expired. Logging out.");
                        logout();
                    } else {
                        await loadUserProfile(token); 
                    }
                } catch (error) {
                    console.error("Session restoration failed:", error.message);
                    logout();
                }
                setLoading(false);
            })();
        } else {
            setLoading(false);
        }
    }, [loadUserProfile]); // Fix: Add `loadUserProfile` as a dependency

    // FIX: Added try/catch to correctly propagate the server's error message
    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/users/login', { email, password });
            return setAuthSession(res.data.token, res.data.user);
        } catch (err) {
            // Throw the server's specific message (e.g., "Invalid Credentials")
            throw new Error(err.response?.data?.msg || 'Login failed due to server error.');
        }
    };

    const register = async (formData) => {
        try {
            const res = await axios.post('/api/users/register', formData);
            return setAuthSession(res.data.token, res.data.user);
        } catch (err) {
            // Throw the server's specific message
            throw new Error(err.response?.data?.msg || 'Registration failed due to server error.');
        }
    };

    // For handling the server-side OAuth redirect (/social-login-success)
    const authenticateGoogleUser = async (token) => { 
        return setAuthSession(token);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        authenticateGoogleUser,
    };

    if (loading) {
        return <div>Loading authentication session...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

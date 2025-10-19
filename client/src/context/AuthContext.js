import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const setAuthSession = (token) => {
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token).user;
        setUser(decodedUser);
        axios.defaults.headers.common['x-auth-token'] = token;
        return decodedUser;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Restore session from localStorage token
                setAuthSession(token);
            } catch (error) {
                // Clear storage if token is invalid or expired
                localStorage.removeItem('token');
                console.error("Token decoding failed:", error);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/users/login', { email, password });
            const token = res.data.token;
            return setAuthSession(token);
        } catch (err) {
            console.error('Login failed:', err.response.data.msg);
            throw err;
        }
    };

    const register = async (formData) => {
        try {
            const res = await axios.post('/api/users/register', formData);
            const token = res.data.token;
            return setAuthSession(token);
        } catch (err) {
            console.error('Registration failed:', err.response.data.msg);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        // Expose setUser directly for the Google Auth component to update state after verification
        setUser 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
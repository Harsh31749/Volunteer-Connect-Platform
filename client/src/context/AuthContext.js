import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

<<<<<<< HEAD
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
=======
// Function to decode the JWT manually (without using jwt-decode)
const decodeToken = (token) => {
  // Split the token into parts (header, payload, signature)
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  // Base64-decode the payload (the second part)
  const payload = atob(parts[1]);

  // Parse the payload string to JSON
  return JSON.parse(payload);
};

const isTokenExpired = (decodedToken) => {
  // JWT exp is in seconds, Date.now() is in milliseconds
  if (!decodedToken || !decodedToken.exp) return true;
  return decodedToken.exp * 1000 < Date.now();
};
>>>>>>> ad8ffeaf422495bbebab381455c6cd8ece9dc28e

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    // Helper: Fetches the full user profile from the server using the active token
    const loadUserProfile = async (token) => {
        try {
            const res = await axios.get('/api/users/profile', {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            return res.data; // Return full user object
        } catch (err) {
            console.error('Failed to load user profile.', err.message);
            logout();
            return null;
        }
    };

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
                    // Set token first to enable authenticated requests
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
    }, []);

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
=======
  const setAuthSession = (token) => {
    const decodedToken = decodeToken(token);

    // Check if the token is expired immediately upon decoding
    if (isTokenExpired(decodedToken)) {
      throw new Error('Token expired during session setup.');
>>>>>>> ad8ffeaf422495bbebab381455c6cd8ece9dc28e
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

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      return setAuthSession(res.data.token);
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || 'Unknown error');
      throw new Error(err.response?.data?.msg || 'Login failed due to server error.');
    }
  };

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/users/register', formData);
      return setAuthSession(res.data.token);
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.msg || 'Unknown error');
      throw new Error(err.response?.data?.msg || 'Registration failed due to server error.');
    }
  };

  // NEW FUNCTION: For Google Auth Component
  const authenticateGoogleUser = (token) => {
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

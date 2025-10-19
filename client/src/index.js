import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'

const GOOGLE_CLIENT_ID = '998192214747-59q3n6bok95hlc9j6e0u20kdr22tvts9.apps.googleusercontent.com';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router> 
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
                <AuthProvider> 
                    <App />
                </AuthProvider>
            </GoogleOAuthProvider>
        </Router>
    </React.StrictMode>
);
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleAuth from './GoogleAuth'; 
import '../../App.css'; // <-- ADDED: Ensure App.css is available for class styles

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        try {
            const loggedInUser = await login(email, password);
            
            if (loggedInUser.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Check email and password.');
        }
    };

    return (
        // Use the new login-page class for the outer container
        <div className="login-page">
            <div className="container" style={{maxWidth: '450px', width: '100%'}}> 
                {/* Use the new header group class */}
                <div className="login-header-group">
                    <h1 style={{color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 800}}>Welcome Back</h1>
                    <p style={{color: 'var(--color-text-light)'}}>Sign in to access your volunteer hub.</p>
                </div>

                {/* Use the new login-card class */}
                <div className="login-card">
                    
                    {/* 1. GOOGLE SIGN-IN OPTION */}
                    <GoogleAuth />
                    
                    {/* OR Separator: Replaced inline styles with 'separator-line' and 'separator-text' classes */}
                    <div className="separator-line">
                        <span className="separator-text">
                            OR CONTINUE WITH EMAIL
                        </span>
                    </div>

                    {/* 2. EMAIL/PASSWORD OPTION */}
                    <form onSubmit={onSubmit}>
                        {/* Email Input: Used 'input-group' and 'input-field' classes */}
                        <div className="input-group">
                            <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required className="input-field" />
                        </div>
                        
                        {/* Password Input: Used 'password-group' and 'input-field' classes */}
                        <div className="password-group">
                            <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required className="input-field" />
                        </div>

                        {/* Error Message: Used 'error-message' class */}
                        {error && <div className="error-message">Error: {error}</div>}

                        {/* Login Button: Used 'btn-base' and 'btn-vibrant' classes, kept width/font inline for specificity */}
                        <button
                            type="submit"
                            className="btn-base btn-vibrant" 
                            style={{ width: '100%', fontWeight: 'bold' }}
                        >
                            Sign In
                        </button>
                    </form>
                    
                </div>
                
                {/* Footer Link: Used 'need-account-text' class */}
                <p className="need-account-text">
                    Need an account? <Link to="/register" style={{color: 'var(--color-secondary)', fontWeight: 600}}>Sign Up Here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
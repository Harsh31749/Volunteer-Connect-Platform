import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleAuth from './GoogleAuth'; 

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
            setError(err.message || 'Login failed.');
        }
    };

    return (
        <div style={{ 
            background: 'var(--color-background)', 
            minHeight: '100vh', 
            paddingTop: '5rem',
            display: 'flex', 
            justifyContent: 'center', 
        }}>
            <div className="container" style={{maxWidth: '450px', width: '100%'}}> 
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <h1 style={{color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 800}}>Sign In to Your Account</h1>
                    <p style={{color: 'var(--color-text-light)'}}>Access your Volunteer or NGO Dashboard</p>
                </div>

                <div style={{
                    backgroundColor: 'var(--color-card-bg)', 
                    padding: '40px', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 30px var(--color-shadow)'
                }}>
                    
                    {/* 1. GOOGLE SIGN-IN OPTION */}
                    <GoogleAuth />
                    
                    {/* OR Separator */}
                    <div style={{ 
                        borderBottom: '1px solid #ddd', 
                        lineHeight: '0.1em', 
                        margin: '30px 0', 
                        textAlign: 'center' 
                    }}>
                        <span style={{ background: 'var(--color-card-bg)', padding: '0 10px', color: '#888', fontWeight: 600 }}>
                            OR SIGN IN WITH EMAIL
                        </span>
                    </div>

                    {/* 2. MANUAL EMAIL/PASSWORD FORM */}
                    <form onSubmit={onSubmit}>
                        
                        {/* Email Input */}
                        <div style={{marginBottom: '15px'}}>
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                name="email" 
                                value={email} 
                                onChange={onChange} 
                                required 
                                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'var(--color-input-bg)'}} 
                            />
                        </div>
                        
                        {/* Password Input */}
                        <div style={{marginBottom: '25px'}}>
                            <input 
                                type="password" 
                                placeholder="Password" 
                                name="password" 
                                value={password} 
                                onChange={onChange} 
                                required 
                                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'var(--color-input-bg)'}} 
                            />
                        </div>

                        {error && <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>Error: {error}</div>}

                        <button
                            type="submit"
                            className="btn-vibrant" 
                            style={{ width: '100%', fontWeight: 'bold' }}
                        >
                            Sign In
                        </button>
                    </form>
                    
                </div>
                
                <p style={{textAlign: 'center', marginTop: '20px', color: 'var(--color-text-light)'}}>
                    Don't have an account? <Link to="/register" style={{color: 'var(--color-primary)', fontWeight: 600}}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
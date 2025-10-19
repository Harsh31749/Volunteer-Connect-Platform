import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleAuth from './GoogleAuth'; 

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        ngoName: '',
        role: 'volunteer' // Default role
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const { name, email, password, ngoName, role } = formData;

    const onChange = e => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(''); 

        if (role === 'ngo' && !ngoName) {
            return setError('Organization Name is required for organizers.');
        }

        try {
            const userData = { name, email, password, role };
            if (role === 'ngo') {
                userData.ngoName = ngoName;
            }
            
            const loggedInUser = await register(userData);

            if (loggedInUser.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
        }
    };

    return (
        <div style={{ 
            background: 'var(--color-background)', 
            minHeight: '100vh', 
            paddingTop: '5rem',
            // Fix: Center the page content
            display: 'flex', 
            justifyContent: 'center', 
        }}>
            <div className="container" style={{maxWidth: '450px', width: '100%'}}> 
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <h1 style={{color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: 800}}>Create Your Account</h1>
                    <p style={{color: 'var(--color-text-light)'}}>Join us as a Volunteer or an NGO Organizer</p>
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
                            OR SIGN UP WITH EMAIL
                        </span>
                    </div>

                    {/* 2. EMAIL/PASSWORD FORM */}
                    <form onSubmit={onSubmit}>
                        {/* Role Selection */}
                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', color: 'var(--color-text-light)'}}>Account Type:</label>
                            <select name="role" value={role} onChange={onChange} style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}>
                                <option value="volunteer">Volunteer</option>
                                <option value="ngo">NGO Organizer</option>
                            </select>
                        </div>
                        
                        {/* Full Name */}
                        <div style={{marginBottom: '15px'}}>
                            <input type="text" placeholder="Full Name" name="name" value={name} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                        </div>
                        
                        {/* Email */}
                        <div style={{marginBottom: '15px'}}>
                            <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                        </div>
                        
                        {/* Password */}
                        <div style={{marginBottom: '15px'}}>
                            <input type="password" placeholder="Password (min 6 chars)" name="password" value={password} onChange={onChange} minLength="6" required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                        </div>

                        {/* Conditional NGO Name Field */}
                        {role === 'ngo' && (
                            <div style={{marginBottom: '25px'}}>
                                <input type="text" placeholder="Organization Name" name="ngoName" value={ngoName} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                            </div>
                        )}
                        
                        {error && <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>Error: {error}</div>}

                        <button
                            type="submit"
                            className="btn-vibrant" 
                            style={{ width: '100%', fontWeight: 'bold' }}
                        >
                            Sign Up
                        </button>
                    </form>
                    
                </div>
                
                <p style={{textAlign: 'center', marginTop: '20px', color: 'var(--color-text-light)'}}>
                    Already have an account? <Link to="/login" style={{color: 'var(--color-primary)', fontWeight: 600}}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
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

        // Client-side validation check
        if (role === 'ngo' && !ngoName) {
            return setError('Organization Name is required for NGO accounts.');
        }

        try {
            const userData = { name, email, password, role };
            if (role === 'ngo') {
                userData.ngoName = ngoName;
            }
            
            // The register function in AuthContext now returns the user object
            const loggedInUser = await register(userData);

            // Redirect user to their appropriate dashboard after successful registration
            if (loggedInUser.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (err) {
            // Use the detailed error message propagated from AuthContext (and backend)
            setError(err.message || 'Registration failed.'); 
        }
    };

    const baseInputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm";

    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const divStyle = "mb-4";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md"> 
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-indigo-600">
                        Create Your Account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us as a Volunteer or an NGO Organizer
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10">
                    
                    {/* 1. GOOGLE SIGN-IN OPTION (Preserving existing component) */}
                    <GoogleAuth />
                    
                    {/* OR Separator (Modernized) */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-sm font-medium text-gray-500">
                                OR SIGN UP WITH EMAIL
                            </span>
                        </div>
                    </div>

                    {/* 2. EMAIL/PASSWORD FORM */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        
                        {/* Role Selection */}
                        <div className={divStyle}>
                            <label htmlFor="role" className={labelStyle}>Account Type:</label>
                            <select 
                                id="role"
                                name="role" 
                                value={role} 
                                onChange={onChange} 
                                className={baseInputStyle + " bg-white appearance-none"}
                            >
                                <option value="volunteer">Volunteer</option>
                                <option value="ngo">NGO Organizer</option>
                            </select>
                        </div>
                        
                        {/* Full Name */}
                        <div className={divStyle}>
                            <label htmlFor="name" className={labelStyle}>Full Name</label>
                            <input 
                                id="name"
                                type="text" 
                                placeholder="Full Name" 
                                name="name" 
                                value={name} 
                                onChange={onChange} 
                                required 
                                className={baseInputStyle} 
                            />
                        </div>
                        
                        {/* Email */}
                        <div className={divStyle}>
                            <label htmlFor="email" className={labelStyle}>Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="Email Address" 
                                name="email" 
                                value={email} 
                                onChange={onChange} 
                                required 
                                className={baseInputStyle} 
                            />
                        </div>
                        
                        {/* Password */}
                        <div className={divStyle}>
                            <label htmlFor="password" className={labelStyle}>Password</label>
                            <input 
                                id="password"
                                type="password" 
                                placeholder="Password (min 6 chars)" 
                                name="password" 
                                value={password} 
                                onChange={onChange} 
                                minLength="6" 
                                required 
                                className={baseInputStyle} 
                            />
                        </div>

                        {/* Conditional NGO Name Field */}
                        {role === 'ngo' && (
                            <div className={divStyle + " mb-6"}>
                                <label htmlFor="ngoName" className={labelStyle}>Organization Name</label>
                                <input 
                                    id="ngoName"
                                    type="text" 
                                    placeholder="Organization Name" 
                                    name="ngoName" 
                                    value={ngoName} 
                                    onChange={onChange} 
                                    required 
                                    className={baseInputStyle} 
                                />
                            </div>
                        )}
                        
                        {/* Error Message Display (Modernized) */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.7a.75.75 0 00-1.06 1.06L8.94 10l-1.3 1.3a.75.75 0 101.06 1.06L10 11.06l1.3 1.3a.75.75 0 101.06-1.06L11.06 10l1.3-1.3a.75.75 0 00-1.06-1.06L10 8.94l-1.3-1.3z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error: {error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button (Modernized to fit the vibrant style) */}
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent 
                                       rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 
                                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-indigo-500 transition duration-150 ease-in-out"
                        >
                            Sign Up
                        </button>
                    </form>
                    
                </div>
                
                {/* Footer Link */}
                <p className="text-center mt-4 text-sm text-gray-600">
                    Already have an account? 
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
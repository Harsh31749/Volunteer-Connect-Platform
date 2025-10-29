import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // FIX: Correctly import the custom hook
import GoogleAuth from './GoogleAuth'; 

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    // FIX: Use the useAuth() hook directly to get the login function.
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        try {
            // Backend logic remains untouched
            const loggedInUser = await login(email, password); 

            if (loggedInUser.role === 'ngo') {
                navigate('/dashboard/ngo');
            } else {
                navigate('/dashboard/volunteer');
            }
        } catch (err) {
            // Error handling logic preserved from AuthContext.js
            setError(err.message || 'Login failed.');
        }
    };

    const inputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm bg-white";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md"> 
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-indigo-600">
                        Sign In to Your Account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Access your Volunteer or NGO Dashboard
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10 border-t-4 border-indigo-500">
                    
                    {/* 1. GOOGLE SIGN-IN OPTION */}
                    <GoogleAuth />
                    
                    {/* OR Separator */}
                    <div className="relative my-6"> 
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 bg-white text-sm font-medium text-gray-500">
                                OR SIGN IN WITH EMAIL
                            </span>
                        </div>
                    </div>

                    {/* 2. MANUAL EMAIL/PASSWORD FORM */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="Email Address" 
                                name="email" 
                                value={formData.email} 
                                onChange={onChange} 
                                required 
                                className={inputStyle} 
                            />
                        </div>
                        
                        {/* Password Input */}
                        <div className="mb-6">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input 
                                id="password"
                                type="password" 
                                placeholder="Password" 
                                name="password" 
                                value={formData.password} 
                                onChange={onChange} 
                                required 
                                className={inputStyle} 
                            />
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="rounded-lg bg-red-100 p-3 border-l-4 border-red-500 text-red-700 font-medium">
                                Error: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent 
                                       rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 
                                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-indigo-500 transition duration-150 ease-in-out"
                        >
                            Sign In
                        </button>
                    </form>
                    
                </div>
                
                {/* Footer Link */}
                <p className="text-center mt-4 text-sm text-gray-600">
                    Don't have an account? 
                    <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
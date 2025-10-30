import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        ngoName: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Only fetch profile data once the global authentication state is resolved and a user is available
        if (!authLoading && user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        try {
            // Fetch the current user's full profile data using the secured GET /api/users/profile route
            const res = await axios.get('/api/users/profile');
            const { name, email, ngoName } = res.data;
            
            // Populate form state with fetched data
            setFormData({ name, email, ngoName: ngoName || '' });
        } catch (err) {
            console.error("Profile fetch error:", err);
            toast.error("Profile fetch error:", err);
            setError('Failed to fetch profile data.');
        } finally {
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        setMessage('');

        const dataToUpdate = {
            name: formData.name,
        };
        
        // Conditionally include ngoName for NGO roles
        if (user.role === 'ngo') {
            if (!formData.ngoName) {
                return setError('Organization Name is required for NGO accounts.');
            }
            dataToUpdate.ngoName = formData.ngoName;
        }

        try {
            // Submit data to the secured PUT /api/users/profile route (Logic preserved)
            await axios.put('/api/users/profile', dataToUpdate);
            
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile.');
        }
    };

    const inputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm bg-white";

    const labelStyle = "block text-sm font-medium text-gray-700 mb-2";

    if (loading || authLoading) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Loading profile settings...
        </div>
    );
    if (error && !message) return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            {error}
        </div>
    );

    const roleLabel = user.role === 'ngo' ? 'Host Organizer' : 'Volunteer';
    const dashboardPath = user.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/volunteer';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-4xl">
                
                {/* Back to Dashboard Link */}
                <Link 
                    to={dashboardPath} 
                    className="flex items-center mb-6 text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium"
                >
                    {/* SVG replacement for fas fa-arrow-left */}
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </Link>
                
                {/* Header */}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                    Account Settings
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Managing your <strong className="text-indigo-600">{roleLabel}</strong> Profile.
                </p>

                {/* Form Card */}
                <form 
                    onSubmit={onSubmit} 
                    className="bg-white p-6 md:p-8 rounded-xl shadow-2xl space-y-6"
                >
                    
                    {/* Role / Email Status */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <p className="font-semibold text-gray-800 mb-1">
                            Role: <span className="text-orange-600 font-bold">{roleLabel}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Email: {formData.email} (Primary identifier - cannot be changed)
                        </p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label htmlFor="name" className={labelStyle}>Full Name</label>
                        <input 
                            id="name"
                            type="text" 
                            className={inputStyle} 
                            name="name" 
                            value={formData.name} 
                            onChange={onChange} 
                            required 
                        />
                    </div>

                    {/* NGO Name (Only for NGO role) */}
                    {user.role === 'ngo' && (
                        <div>
                            <label htmlFor="ngoName" className={labelStyle}>Organization Name</label>
                            <input 
                                id="ngoName"
                                type="text" 
                                className={inputStyle} 
                                name="ngoName" 
                                value={formData.ngoName} 
                                onChange={onChange} 
                                required 
                            />
                        </div>
                    )}
                    
                    {/* Success/Error Message Display */}
                    {message && (
                        <div className="rounded-lg bg-green-100 p-4 border-l-4 border-green-500 text-green-700 font-medium">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg bg-red-100 p-4 border-l-4 border-red-500 text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-3 px-4 border border-transparent 
                                   rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 
                                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                   focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
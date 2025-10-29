import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Fetch event details (including populated NGO data)
                const res = await axios.get(`/api/events/${id}`);
                setEvent(res.data);
            } catch (err) {
                setError('Event not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleRegistration = async () => {
        if (!user) {
            alert('Please log in to register for an event.');
            return navigate('/login');
        }

        if (user.role !== 'volunteer') {
            return alert('Only Volunteers can register for events.');
        }

        try {
            // API call to the POST /api/registrations/:eventId route (Logic preserved)
            const res = await axios.post(`/api/registrations/${id}`);
            alert(res.data.msg || 'Registration successful!');
            // Redirect to volunteer dashboard after successful registration
            navigate('/dashboard/volunteer'); 

        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration failed due to server error.';
            alert(msg);
        }
    };

    const getRegistrationButton = () => {
        if (!event) return null; // Should be covered by loading/error state but good practice

        if (!user) {
            // The button action handles login redirection internally
            return (
                <button 
                    className="w-full md:w-auto py-3 px-10 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                    onClick={handleRegistration}
                >
                    Login to Volunteer
                </button>
            );
        }
        if (user.role !== 'volunteer') {
            return <p className="text-gray-500 text-center font-medium">Only Volunteers can register for events.</p>;
        }

        // Volunteer is logged in and eligible
        return (
            <button 
                className="w-full md:w-auto py-3 px-10 text-xl font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
                onClick={handleRegistration}
            >
                Volunteer Now
            </button>
        );
    };

    // --- Loading and Error States ---
    if (loading) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Loading event details...
        </div>
    );
    if (error) return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            {error}
        </div>
    );
    if (!event) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Event data is missing.
        </div>
    );

    // Data Formatting
    const ngoName = event.ngo?.ngoName || 'N/A';
    const eventDate = new Date(event.date).toDateString();

return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <Link 
                    to="/" 
                    className="flex items-center mb-6 text-gray-500 hover:text-indigo-600 transition duration-150"
                >
                    {/* Size reduced from w-5 h-5 to w-4 h-4 for subtle link icon */}
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Events
                </Link>
                
                {/* Main Event Card */}
                <div className="bg-white p-6 lg:p-10 rounded-xl shadow-2xl">
                    
                    {/* Title and Description */}
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">{event.title}</h1>
                    <p className="text-lg text-gray-600 mb-6">{event.description}</p>
                    
                    {/* Key Details Section (Icons reduced from w-6 h-6 to w-5 h-5) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 border-t border-b border-gray-200 py-6 mb-8 text-base">
                        
                        {/* Organized By */}
                        <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zM4 9a2 2 0 012-2h7a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9zM2 13a2 2 0 012-2h7a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z"></path></svg>
                            <strong>Organized By:</strong> <span className="ml-2 font-medium">{ngoName}</span>
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <strong>Date:</strong> <span className="ml-2 font-medium">{eventDate}</span>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <strong>Location:</strong> <span className="ml-2 font-medium">{event.location}</span>
                        </div>
                        
                        {/* Slots Available */}
                        <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.5-.118-1.002-.356-1.556m0 0H7m-4.444 0a1 1 0 01-1.332-1.332M4 12v-1c0-1.657 1.343-3 3-3h10c1.657 0 3 1.343 3 3v1m-4 4h2m-2 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-3-3V5m0 0h2m-2 0H8m4 0h2"></path></svg>
                            <strong>Slots:</strong> <span className="ml-2 font-medium">{event.capacity}</span>
                        </div>
                        
                        {/* Category */}
                        <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0v10m0-10L7 17"></path></svg>
                            <strong>Category:</strong> <span className="ml-2 font-medium">{event.category}</span>
                        </div>

                    </div>

                    {/* Registration/Action Button */}
                    <div className="text-center pt-4">
                        {getRegistrationButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
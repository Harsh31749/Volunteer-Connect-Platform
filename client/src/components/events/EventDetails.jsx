import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const defaultEventImage = '/image/volunteer.png'; // fallback image

    useEffect(() => {
        const fetchEvent = async () => {
            try {
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
            toast.error('Please log in to register for an event.');
            return navigate('/login');
        }

        if (user.role !== 'volunteer') {
            return toast.error('Only Volunteers can register for events.');
        }

        try {
            const res = await axios.post(`/api/registrations/${id}`);
            toast.success(res.data.msg || 'Registration successful!');
            navigate('/dashboard/volunteer'); 
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration failed due to server error.';
            toast.error(msg);
        }
    };

    const getRegistrationButton = () => {
        if (!event) return null;

        if (!user) {
            return (
                <button 
                    className="w-full md:w-auto py-4 px-12 text-xl font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                    onClick={handleRegistration}
                >
                    Login to Volunteer
                </button>
            );
        }
        if (user.role !== 'volunteer') {
            return <p className="text-gray-200 text-center font-medium">Only Volunteers can register for events.</p>;
        }

        return (
            <button 
                className="w-full md:w-auto py-4 px-12 text-2xl font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
                onClick={handleRegistration}
            >
                Volunteer Now
            </button>
        );
    };

    if (loading) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Loading event details...
        </div>
    );
    if (error) return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            {error}
        </div>
    );
    if (!event) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Event data is missing.
        </div>
    );

    const ngoName = event.ngo?.ngoName || 'N/A';
    const eventDate = new Date(event.date).toDateString();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 lg:px-8 max-w-full lg:max-w-5xl">
                {/* Back Link */}
                <Link 
                    to="/" 
                    className="flex items-center mb-8 text-gray-300 hover:text-indigo-400 transition duration-150"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Events
                </Link>
                
                {/* Main Event Card with Background Image */}
                <div 
                    className="relative rounded-3xl shadow-3xl overflow-hidden"
                    style={{
                        backgroundImage: `url(${event.image || defaultEventImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '650px', // larger card height
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>

                    {/* Content */}
                    <div className="relative z-10 p-6 lg:p-16 text-white flex flex-col justify-between h-full">
                        <div>
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4">{event.title}</h1>
                            <p className="text-lg lg:text-xl mb-8">{event.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 border-t border-b border-white border-opacity-40 py-6 mb-8 text-lg">
                                <div className="flex items-center">
                                    <strong>Organized By:</strong> <span className="ml-2 font-medium">{ngoName}</span>
                                </div>
                                <div className="flex items-center">
                                    <strong>Date:</strong> <span className="ml-2 font-medium">{eventDate}</span>
                                </div>
                                <div className="flex items-center">
                                    <strong>Location:</strong> <span className="ml-2 font-medium">{event.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <strong>Slots:</strong> <span className="ml-2 font-medium">{event.capacity}</span>
                                </div>
                                <div className="flex items-center">
                                    <strong>Category:</strong> <span className="ml-2 font-medium">{event.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-auto">
                            {getRegistrationButton()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;

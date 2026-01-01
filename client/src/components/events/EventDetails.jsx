import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
// Added Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faUsers, faTag, faBuilding } from '@fortawesome/free-solid-svg-icons';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mapping for category backgrounds (Consistent with EventCard)
    const categoryBackgrounds = {
        Environment: '/image/environment.png',
        Education: '/image/education.png',
        Health: '/image/health.png',
        Community: '/image/community.jpeg',
        Other: '/image/other.png',
    };

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
                    className="w-full md:w-auto py-3 px-8 text-lg font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                    onClick={handleRegistration}
                >
                    Login to Volunteer
                </button>
            );
        }
        if (user.role !== 'volunteer') {
            return <p className="text-gray-200 bg-black/50 p-2 rounded inline-block">Only Volunteers can register for events.</p>;
        }

        return (
            <button 
                className="w-full md:w-auto py-3 px-10 text-xl font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 shadow-xl"
                onClick={handleRegistration}
            >
                Volunteer Now
            </button>
        );
    };

    if (loading) return <div className="text-center text-xl text-gray-700 mt-12">Loading event details...</div>;
    if (error) return <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg shadow-md">{error}</div>;
    if (!event) return null;

    const ngoName = event.ngo?.ngoName || 'N/A';
    const eventDate = new Date(event.date).toDateString();
    
    // Select background image based on category
    const backgroundImage = categoryBackgrounds[event.category] || categoryBackgrounds.Other;

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Link */}
                <Link 
                    to="/#events" 
                    className="inline-flex items-center mb-6 text-indigo-600 font-semibold hover:text-indigo-800 transition duration-150"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Events
                </Link>
                
                <div 
                    className="relative rounded-3xl shadow-2xl overflow-hidden border-4 border-indigo-500 bg-gray-900"
                    style={{ minHeight: '600px' }}
                >
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                    {/* Content Container */}
                    <div className="relative z-10 p-8 lg:p-12 flex flex-col h-full min-h-[600px]">
                        
                        {/* Title Section */}
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 mb-4 text-sm font-bold tracking-wider text-indigo-100 uppercase bg-indigo-600/80 rounded-full">
                                {event.category} Event
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 leading-tight">
                                {event.title}
                            </h1>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-gray-100">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <div className="flex items-center mb-2 text-indigo-300">
                                    <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                                    <span className="text-sm font-bold uppercase">Organizer</span>
                                </div>
                                <p className="text-xl font-semibold">{ngoName}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <div className="flex items-center mb-2 text-indigo-300">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
                                    <span className="text-sm font-bold uppercase">Date</span>
                                </div>
                                <p className="text-xl font-semibold">{eventDate}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <div className="flex items-center mb-2 text-indigo-300">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
                                    <span className="text-sm font-bold uppercase">Location</span>
                                </div>
                                <p className="text-lg font-medium">{event.location}</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <div className="flex items-center mb-2 text-indigo-300">
                                    <FontAwesomeIcon icon={faUsers} className="mr-3" />
                                    <span className="text-sm font-bold uppercase">Availability</span>
                                </div>
                                <p className="text-lg font-medium">{event.capacity} Slots Open</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">About This Event</h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {event.description || "No description provided."}
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto pt-6 text-center">
                            {getRegistrationButton()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
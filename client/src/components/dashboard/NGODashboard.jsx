import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ManageVolunteers from './ManageVolunteers'; 
import CreateEvent from './CreateEvent'; 
import toast from 'react-hot-toast';

const NGODashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentView, setCurrentView] = useState('list'); 
    const [selectedEventId, setSelectedEventId] = useState(null); 

    useEffect(() => {
        if (user && user.role === 'ngo' && currentView === 'list') {
            fetchNgoEvents();
        }
    }, [user, currentView]); 

    const fetchNgoEvents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/ngo/events');
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch NGO events:', err);
            toast.error('Failed to fetch NGO events:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="text-center text-xl text-gray-700 mt-12">
            Loading Host Panel...
        </div>
    );

    if (currentView === 'create') {
        return <CreateEvent onEventCreated={() => setCurrentView('list')} onBack={() => setCurrentView('list')} />;
    }

    if (currentView === 'manage' && selectedEventId) {
        return (
            <ManageVolunteers 
                eventId={selectedEventId} 
                onBack={() => { 
                    setSelectedEventId(null); 
                    setCurrentView('list'); 
                }} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <h1 className="text-3xl lg:text-4xl font-extrabold text-indigo-700 mb-2">
                    Host Panel
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Welcome, <span className="font-semibold text-gray-800">{user?.ngoName || 'Organizer'}</span>! Manage your listings and volunteers.
                </p>

                <button 
                    onClick={() => setCurrentView('create')} 
                    className="flex items-center justify-center space-x-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 mb-8"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>List New Opportunity</span>
                </button>

                {/* Your Organized Events Section with Background Image */}
                <div 
                    className="p-6 md:p-8 shadow-2xl rounded-xl"
                    style={{
                        backgroundImage: "url('/image/organized.png')",  // Replace with your image path
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                    }}
                >
                    <h2 className="text-2xl font-bold text-white border-b border-white pb-3 mb-4">
                        Your Organized Events ({events.length})
                    </h2>

                    {events.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-lg text-gray-500">
                                You have not created any events yet. Click "List New Opportunity" to start.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <div 
                                    key={event._id} 
                                    className={`bg-white p-5 rounded-lg shadow-md transition duration-200 hover:shadow-lg border-l-4 ${event.status === 'Open' ? 'border-green-500' : 'border-gray-400'}`}
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Date: {new Date(event.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm mb-4">
                                        Status: 
                                        <span className={`font-bold ml-1 ${event.status === 'Open' ? 'text-green-600' : 'text-gray-600'}`}>
                                            {event.status}
                                        </span>
                                        <span className="text-gray-500 mx-2">|</span>
                                        Capacity: <span className="font-medium">{event.capacity}</span>
                                    </p>
                                    
                                    <button 
                                        onClick={() => {
                                            setSelectedEventId(event._id);
                                            setCurrentView('manage');
                                        }} 
                                        className="w-full inline-flex justify-center items-center bg-indigo-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-indigo-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.5-.118-1.002-.356-1.556m-2.644 1.556h-2M12 11V3m0 0h2m-2 0H10m2 0v8m-4 4h8m-8 0a2 2 0 114 0m-4 0a2 2 0 114 0"></path></svg>
                                        Manage Volunteers
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        upcoming: [],
        history: [],
        recommendations: [],
        metrics: { totalEventsAttended: 0, volunteerPoints: 0, badges: [] },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'volunteer') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [upcomingRes, historyRes, metricsRes, recRes] = await Promise.all([
                axios.get('/api/volunteers/dashboard/upcoming'),
                axios.get('/api/volunteers/dashboard/history'),
                axios.get('/api/volunteers/metrics'),
                axios.get('/api/volunteers/recommendations')
            ]);
            
            setDashboardData({
                upcoming: upcomingRes.data,
                history: historyRes.data,
                recommendations: recRes.data,
                metrics: metricsRes.data,
            });

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            toast.error('Failed to fetch dashboard data:', err);

        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (regId) => {
        if (window.confirm('Are you sure you want to cancel your registration? This action cannot be undone.')) {
            try {
                await axios.put(`/api/registrations/${regId}/cancel`);
                toast.success('Registration successfully cancelled.');
                fetchDashboardData(); 
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Failed to cancel registration.');
            }
        }
    };

    const handleDownloadCertificate = async (regId, eventTitle) => {
        try {
            const response = await axios.get(
                `/api/volunteers/certificate/${regId}/download`,
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate_${eventTitle?.replace(/\s/g, '_') || 'Event'}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Certificate download successful!');

        } catch (err) {
            console.error('Certificate download failed:', err);
            toast.error('Certificate download failed:', err);
            
            if (err.response && err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const errorJson = JSON.parse(reader.result);
                        toast.error(errorJson.msg || 'Failed to download certificate.');
                    } catch (e) {
                         toast.error('Failed to download certificate. Check server response.');
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                toast.error(err.response?.data?.msg || 'Failed to download certificate. Please check server status.');
            }
        }
    };
    // ------------------------------------------------------------------------

    if (loading) return <div className="text-center text-xl text-gray-700 mt-12">Loading your dashboard...</div>;

    const { upcoming, history, metrics, recommendations } = dashboardData;
    const displayName = user?.name || 'Volunteer'; 

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-indigo-700">
                    Volunteer Dashboard
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Welcome, <span className="font-semibold text-gray-800">{displayName}</span>!
                </p> 
                
                {/* Metrics Card: Your Impact */}
                <div className="bg-teal-500/30 border-l-4 border-indigo-500 p-6 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Impact</h2>
                        <p className="text-2xl font-extrabold text-indigo-600">
                            Events Attended: <span className="font-extrabold">{metrics.totalEventsAttended || 0}</span>
                        </p>
                        
                        
                    </div>
                    
                    {/* Placeholder for badges/achievements if needed */}
                    <Link 
                        to="/settings" 
                        className="text-sm font-medium text-red-700/80 hover:text-red-900/80 transition duration-150 inline-flex items-center"
                    >
                        Edit Profile Settings
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </Link>
                </div>
                
                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500 shadow-md mb-8">
                        <h2 className="text-xl font-bold text-yellow-800 mb-4">✨ Recommended For You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendations.map(event => (
                                <div key={event._id} className="bg-lime-400/30 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-150 border border-gray-100">
                                    <h5 className="text-base font-semibold text-gray-800 line-clamp-1">{event.title}</h5>
                                    <p className="text-xs text-gray-500 mt-1 mb-3">By: {event.ngo?.ngoName || 'N/A'}</p>
                                    <Link 
                                        to={`/events/${event._id}`} 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                                    >
                                        View Details &rarr;
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Upcoming Events */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Events ({upcoming.length})</h2>
                    {upcoming.length === 0 ? (
                        <div className="p-4 bg-amber-400 rounded-lg border-l-4 border-gray-300 shadow-sm">
                            <p className="text-gray-600">You have no upcoming events. 
                                <Link to="/events" className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium">Browse Events</Link>
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {upcoming.map(reg => (
                                <div key={reg._id} className="bg-white p-4 border-l-4 border-indigo-500 rounded-lg shadow-md flex justify-between items-center space-x-4">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{reg.event?.title || 'Unknown Event'}</h3>
                                        <p className="text-sm text-gray-600">
                                            Date: {new Date(reg.event?.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500 font-medium mt-1">Status: <span className="text-indigo-600">{reg.status}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => handleCancel(reg._id)} 
                                        className="flex-shrink-0 py-2 px-3 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-150"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Participation History */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Participation History ({history.length})</h2>
                    {history.length === 0 ? (
                        <div className="p-4 bg-white rounded-lg border-l-4 border-gray-300 shadow-sm">
                            <p className="text-gray-600">No attended events yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {history.map(reg => (
                                <div key={reg._id} className="bg-emerald-400/50 p-4 border-l-4 border-green-500 rounded-lg shadow-md flex justify-between items-center space-x-4">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{reg.event?.title || 'Unknown Event'}</h3>
                                        <p className="text-sm text-gray-600">
                                            Date: {new Date(reg.event?.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-bold text-green-600 mt-1">Status: Attended</p>
                                    </div>
                                    
                                    {/* Download Button */}
                                    {reg.status === 'Attended' && (
                                        <button 
                                            onClick={() => handleDownloadCertificate(reg._id, reg.event?.title)} 
                                            className="flex-shrink-0 inline-flex items-center py-2 px-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition duration-150"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Certificate
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
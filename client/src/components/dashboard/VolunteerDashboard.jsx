import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const VolunteerDashboard = () => {
    // FIX: Removed redundant profileName state, relying on user from context
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        upcoming: [],
        history: [],
        recommendations: [],
        metrics: { totalEventsAttended: 0, volunteerPoints: 0, badges: [] },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ensure user is loaded before fetching data
        if (user && user.role === 'volunteer') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // FIX: Removed redundant '/api/users/profile' call. User data is in context.
            // Use Promise.all for concurrent and efficient fetching of all dashboard data
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
            // Optionally, set a general error state for display
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (regId) => {
        if (window.confirm('Are you sure you want to cancel your registration? This action cannot be undone.')) {
            try {
                // API call to PUT /api/registrations/:regId/cancel
                await axios.put(`/api/registrations/${regId}/cancel`);
                alert('Registration successfully cancelled.');
                // Refetch all data to update dashboard state completely
                fetchDashboardData(); 
            } catch (err) {
                alert(err.response?.data?.msg || 'Failed to cancel registration.');
            }
        }
    };

    // --- CORRECTED DOWNLOAD HANDLER: Uses Axios to fetch the Blob securely ---
    const handleDownloadCertificate = async (regId, eventTitle) => {
        try {
            // 1. Make an authenticated GET request to fetch the PDF as a Blob
            const response = await axios.get(
                `/api/volunteers/certificate/${regId}/download`,
                {
                    responseType: 'blob', // IMPORTANT: tells axios to handle the response as binary data
                }
            );

            // 2. Create a temporary URL for the Blob data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // 3. Create a hidden link and simulate a click to trigger download
            const link = document.createElement('a');
            link.href = url;
            // Use the event title for a user-friendly filename
            link.setAttribute('download', `certificate_${eventTitle?.replace(/\s/g, '_') || 'Event'}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // 4. Clean up the temporary URL and link
            link.remove();
            window.URL.revokeObjectURL(url);
            alert('Certificate download successful!');

        } catch (err) {
            console.error('Certificate download failed:', err);
            
            // --- Improved Error Handling for Failed Blob Response (e.g., 401, 404) ---
            if (err.response && err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const errorJson = JSON.parse(reader.result);
                        // Display the specific error message from the server (e.g., "Registration not found.")
                        alert(errorJson.msg || 'Failed to download certificate.');
                    } catch (e) {
                         alert('Failed to download certificate. Check server response.');
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                 alert(err.response?.data?.msg || 'Failed to download certificate. Please check server status.');
            }
        }
    };
    // ------------------------------------------------------------------------

    if (loading) return <h1 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px'}}>Loading your dashboard...</h1>;

    const { upcoming, history, metrics, recommendations } = dashboardData;
    // Use name directly from context, which is guaranteed to be up-to-date
    const displayName = user?.name || 'Volunteer'; 

    return (
        <div className="container" style={{padding: '30px', background: 'var(--color-background)', minHeight: '100vh'}}>
            <h1 style={{color: 'var(--color-primary)', fontSize: '2.5rem'}}>Volunteer Dashboard</h1>
            
            <p style={{color: 'var(--color-text-light)', fontSize: '1.2rem', marginBottom: '1.5rem'}}>
                Welcome, {displayName}!
            </p> 
            
            {/* Metrics Card */}
            <div style={{ background: '#e0f7fa', borderLeft: '6px solid var(--color-primary)', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
                <h2>Your Impact</h2>
                <p style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Volunteer Points: {metrics.volunteerPoints || 0}
                </p>
                <p>Events Attended: {metrics.totalEventsAttended || 0}</p>
                <Link to="/settings" style={{ color: 'var(--color-secondary)' }}>Edit Profile Settings</Link>
            </div>
            
            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div style={{ background: '#fff0e5', padding: '2rem', borderRadius: '10px', borderLeft: '5px solid var(--color-secondary)', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--color-secondary)' }}>✨ Recommended For You</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' }}>
                        {recommendations.map(event => (
                            <div key={event._id} style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <h5 style={{fontSize: '16px', fontWeight: 600}}>{event.title}</h5>
                                <p style={{fontSize: '14px', color: 'var(--color-text-light)'}}>By: {event.ngo?.ngoName || 'N/A'}</p>
                                <Link to={`/events/${event._id}`} style={{color: 'var(--color-primary)', fontSize: '14px'}}>View Details &rarr;</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Upcoming Events */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--color-text)' }}>Upcoming Events ({upcoming.length})</h2>
                {upcoming.length === 0 ? (
                    <p style={{padding: '15px', background: 'white', borderRadius: '8px', borderLeft: '3px solid #ddd'}}>You have no upcoming events. <Link to="/" style={{color: 'var(--color-secondary)'}}>Browse Events</Link></p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '15px' }}>
                        {upcoming.map(reg => (
                            // FIX: Use optional chaining on nested properties from populated fields
                            <div key={reg._id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <h3>{reg.event?.title || 'Unknown Event'}</h3>
                                <p>Date: {new Date(reg.event?.date).toLocaleDateString()}</p>
                                <p style={{fontSize: '14px', color: 'var(--color-text-light)'}}>Status: {reg.status}</p>
                                <button onClick={() => handleCancel(reg._id)} style={{marginTop: '10px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                    Cancel Registration
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Participation History */}
            <div>
                <h2 style={{ color: 'var(--color-text)' }}>Participation History ({history.length})</h2>
                 {history.length === 0 ? (
                    <p style={{padding: '15px', background: 'white', borderRadius: '8px', borderLeft: '3px solid #ddd'}}>No attended events yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '15px' }}>
                        {history.map(reg => (
                            <div key={reg._id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', borderLeft: '3px solid var(--color-success)' }}>
                                <h3>{reg.event?.title || 'Unknown Event'}</h3>
                                <p>Date: {new Date(reg.event?.date).toLocaleDateString()}</p>
                                <p style={{color: 'var(--color-success)', fontWeight: 'bold'}}>Status: Attended</p>
                                {/* UPDATED BUTTON for authenticated download */}
                                {reg.status === 'Attended' && (
                                    <button 
                                        // Pass event title for cleaner filename
                                        onClick={() => handleDownloadCertificate(reg._id, reg.event?.title)} 
                                        style={{
                                            marginTop: '10px', 
                                            padding: '8px 15px', 
                                            backgroundColor: 'var(--color-primary)', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Download Certificate 📜
                                    </button>
                                )}
                                {/* END UPDATED BUTTON */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;
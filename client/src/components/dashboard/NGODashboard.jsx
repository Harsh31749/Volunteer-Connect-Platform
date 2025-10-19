import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ManageVolunteers from './ManageVolunteers'; 
import CreateEvent from './CreateEvent'; 

const NGODashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentView, setCurrentView] = useState('list'); 
    const [selectedEventId, setSelectedEventId] = useState(null); 

    useEffect(() => {
        if (user && user.role === 'ngo') {
            fetchNgoEvents();
        }
    }, [user, currentView]); 

    const fetchNgoEvents = async () => {
        setLoading(true);
        try {
            // This endpoint enforces that only the logged-in NGO's events are returned
            const res = await axios.get('/api/ngo/events');
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch NGO events:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <h1 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px'}}>Loading Host Panel...</h1>;

    // --- RENDER LOGIC BASED ON currentView STATE ---

    if (currentView === 'create') {
        return <CreateEvent onEventCreated={() => setCurrentView('list')} onBack={() => setCurrentView('list')} />;
    }

    if (currentView === 'manage' && selectedEventId) {
        return (
            <ManageVolunteers 
                eventId={selectedEventId} 
                onBack={() => { 
                    setSelectedEventId(null); 
                    // Refetches events automatically because currentView changes
                    setCurrentView('list'); 
                }} 
            />
        );
    }

    // Default View: Event List (currentView === 'list')
    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingBottom: '3rem' }}>
            <div className="container-fluid" style={{padding: '30px 0'}}>
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Host Panel
                </h1>
                <p style={{ color: 'var(--color-text-light)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                    {/* FIX: Used optional chaining (?.) for robust access to user.ngoName */}
                    Welcome, {user?.ngoName || 'Organizer'}! Manage your listings and volunteers.
                </p>

                <button 
                    onClick={() => setCurrentView('create')} 
                    className="btn-vibrant" 
                    style={{ marginBottom: '2rem' }}
                >
                    <i className="fas fa-plus" style={{marginRight: '8px'}}></i> List New Opportunity
                </button>
                
                {/* Main Events Container */}
                <div style={{ background: 'var(--color-card-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 25px var(--color-shadow)' }}>
                    <h2 style={{ color: 'var(--color-text)', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                        Your Organized Events ({events.length})
                    </h2>
                    
                    {events.length === 0 ? (
                        <p style={{textAlign: 'center', color: 'var(--color-text-light)', padding: '20px'}}>
                            You have not created any events yet. Click "List New Opportunity" to start.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginTop: '15px' }}>
                            {events.map(event => (
                                <div key={event._id} style={{
                                    backgroundColor: '#fff', 
                                    padding: '20px', 
                                    borderRadius: '10px', 
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                    // Accent based on status
                                    borderLeft: event.status === 'Open' ? '5px solid var(--color-success)' : '5px solid var(--color-text-light)',
                                    transition: 'box-shadow 0.2s'
                                }}>
                                    <h3 style={{fontSize: '18px', marginBottom: '5px', color: 'var(--color-primary)'}}>{event.title}</h3>
                                    <p style={{fontSize: '14px', color: 'var(--color-text-light)'}}>Date: {new Date(event.date).toLocaleDateString()}</p>
                                    <p style={{fontSize: '14px', marginBottom: '15px'}}>Status: <span style={{fontWeight: 600}}>{event.status}</span> | Capacity: {event.capacity}</p>
                                    
                                    <button 
                                        onClick={() => {
                                            setSelectedEventId(event._id);
                                            setCurrentView('manage');
                                        }} 
                                        className="btn-primary" 
                                        style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '8px 15px', borderRadius: '5px', fontSize: '14px' }}
                                    >
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
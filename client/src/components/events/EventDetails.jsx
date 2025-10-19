import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    // user contains {id, email, role, ...} after our AuthContext fixes
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
            // API call to the POST /api/registrations/:eventId route
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
        if (!user) {
            // The button action is handled by the initial check in handleRegistration
            return <button className="btn-vibrant" style={{background: 'var(--color-primary)'}} onClick={handleRegistration}>Login to Register</button>;
        }
        if (user.role !== 'volunteer') {
            return <p style={{color: 'var(--color-text-light)'}}>Only Volunteers can register for events.</p>;
        }

        // Volunteer is logged in and eligible
        return (
            <button 
                className="btn-vibrant"
                onClick={handleRegistration}
                style={{ fontSize: '1.2rem', padding: '15px 40px' }}
            >
                Volunteer Now
            </button>
        );
    };

    if (loading) return <h1 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px', color: 'var(--color-text-light)'}}>Loading event details...</h1>;
    if (error) return <div style={{padding: '15px', backgroundColor: '#dc3545', color: 'white', borderRadius: '5px', maxWidth: '600px', margin: '50px auto'}}>{error}</div>;
    if (!event) return <h1 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px', color: 'var(--color-text-light)'}}>Event data is missing.</h1>;

    // FIX: Use optional chaining (?.) for safely accessing populated NGO data
    const ngoName = event.ngo?.ngoName || 'N/A';
    const eventDate = new Date(event.date).toDateString();

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '30px 0' }}>
            <div className="container-fluid" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link to="/" style={{color: 'var(--color-text-light)', marginBottom: '20px', display: 'block'}}>
                    <i className="fas fa-arrow-left" style={{marginRight: '8px'}}></i> Back to Events
                </Link>
                
                <div style={{backgroundColor: 'var(--color-card-bg)', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px var(--color-shadow)'}}>
                    
                    <h1 style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem'}}>{event.title}</h1>
                    <p style={{color: 'var(--color-text-light)', marginBottom: '20px'}}>{event.description}</p>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '30px', fontSize: '16px'}}>
                        
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <i className="fas fa-building" style={{color: 'var(--color-primary)', marginRight: '10px'}}></i>
                            <strong>Organized By:</strong> {ngoName}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <i className="fas fa-calendar-alt" style={{color: 'var(--color-success)', marginRight: '10px'}}></i>
                            <strong>Date:</strong> {eventDate}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <i className="fas fa-map-marker-alt" style={{color: 'var(--color-secondary)', marginRight: '10px'}}></i>
                            <strong>Location:</strong> {event.location}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <i className="fas fa-users" style={{color: 'var(--color-text)', marginRight: '10px'}}></i>
                            <strong>Slots Available:</strong> {event.capacity}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <i className="fas fa-tag" style={{color: 'var(--color-primary)', marginRight: '10px'}}></i>
                            <strong>Category:</strong> {event.category}
                        </div>

                    </div>

                    <div style={{textAlign: 'center'}}>
                        {getRegistrationButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
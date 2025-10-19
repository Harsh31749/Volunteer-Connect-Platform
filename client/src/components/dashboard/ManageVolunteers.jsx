import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageVolunteers = ({ eventId, onBack }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // FIX: Define the fetching function inside useEffect to satisfy React Hooks rules.
    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/events/${eventId}/registrations`);
                setRegistrations(res.data);
            } catch (err) {
                setError('Failed to fetch registrations for this event.');
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, [eventId]); 

    const handleVerify = async (registrationId) => {
        if (!window.confirm('Confirm attendance and trigger certificate email?')) {
            return;
        }
        try {
            // API call to PUT /api/registrations/:registrationId/verify (Triggers certificate)
            await axios.put(`/api/registrations/${registrationId}/verify`);
            alert('Attendance verified! Certificate email sent.');
            
            // Manually update the state for the verified registration status
            setRegistrations(regs => 
                regs.map(reg => 
                    reg._id === registrationId ? { ...reg, status: 'Attended' } : reg
                )
            );
        } catch (err) {
            alert(err.response?.data?.msg || 'Verification failed.');
        }
    };

    if (loading) return <h2 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px'}}>Loading volunteer list...</h2>;
    if (error) return <div style={{padding: '15px', backgroundColor: '#dc3545', color: 'white', borderRadius: '5px', maxWidth: '600px', margin: '50px auto'}}>{error}</div>;

    return (
        <div className="container-fluid" style={{padding: '30px 0'}}>
            <button onClick={onBack} style={{color: 'var(--color-primary)', display: 'block', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}>
                <i className="fas fa-arrow-left" style={{marginRight: '8px'}}></i> Back to Event List
            </button>
            
            <h1 style={{ color: 'var(--color-text)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Volunteer Sign-Ups</h1>
            <p className="lead" style={{color: 'var(--color-text-light)', marginBottom: '1.5rem'}}>Total Registered: <span style={{fontWeight: 700}}>{registrations.length}</span></p>

            {registrations.length === 0 ? (
                <div style={{ padding: '20px', background: '#fff0e5', borderRadius: '10px', borderLeft: '5px solid var(--color-secondary)' }}>
                    <p style={{color: 'var(--color-text-light)'}}>No volunteers have signed up for this event yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    {registrations.map(reg => (
                        <div key={reg._id} style={{
                            backgroundColor: 'var(--color-card-bg)', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 15px var(--color-shadow)',
                            borderLeft: reg.status === 'Attended' ? '5px solid var(--color-success)' : '5px solid var(--color-primary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <p style={{fontWeight: 600, fontSize: '18px'}}>{reg.volunteer.name}</p>
                                <p style={{fontSize: '14px', color: 'var(--color-text-light)'}}>{reg.volunteer.email}</p>
                                <p style={{fontSize: '14px', fontWeight: 600, marginTop: '5px'}}>
                                    Status: 
                                    <span style={{color: reg.status === 'Attended' ? 'var(--color-success)' : 'var(--color-secondary)'}}>
                                        {' ' + reg.status}
                                    </span>
                                </p>
                            </div>

                            {reg.status !== 'Attended' ? (
                                <button 
                                    onClick={() => handleVerify(reg._id)} 
                                    className="btn-vibrant" 
                                    style={{ padding: '8px 15px', fontSize: '14px', lineHeight: '1' }}
                                >
                                    Verify Attendance
                                </button>
                            ) : (
                                <span style={{color: 'var(--color-success)', fontWeight: 'bold', fontSize: '16px'}}>
                                    <i className="fas fa-check-circle" style={{marginRight: '5px'}}></i> Verified
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageVolunteers;
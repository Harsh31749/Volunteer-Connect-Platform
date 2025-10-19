import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

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
        if (!authLoading && user) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        try {
            // Fetch the current user's full profile data
            const res = await axios.get('/api/users/profile');
            const { name, email, ngoName } = res.data;
            // Populate form state with fetched data
            setFormData({ name, email, ngoName: ngoName || '' });
        } catch (err) {
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
        if (user.role === 'ngo') {
            dataToUpdate.ngoName = formData.ngoName;
        }

        try {
            await axios.put('/api/users/profile', dataToUpdate);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile.');
        }
    };

    if (loading || authLoading) return <h1 style={{textAlign: 'center', fontSize: '20px', marginTop: '50px'}}>Loading profile settings...</h1>;
    if (error) return <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', maxWidth: '600px', margin: '50px auto'}}>{error}</div>;

    const roleLabel = user.role === 'ngo' ? 'Host Organizer' : 'Volunteer';

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingTop: '30px', paddingBottom: '30px' }}>
            <div className="container-fluid" style={{maxWidth: '800px'}}>
                {/* Back to Dashboard Link */}
                <Link to={user.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/volunteer'} style={{color: 'var(--color-primary)', display: 'block', marginBottom: '20px'}}>
                    <i className="fas fa-arrow-left" style={{marginRight: '8px'}}></i> Back to Dashboard
                </Link>
                
                <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Account Settings
                </h1>
                <p style={{ color: 'var(--color-text-light)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                    Managing your **{roleLabel}** Profile.
                </p>

                <form onSubmit={onSubmit} style={{
                    backgroundColor: 'var(--color-card-bg)', 
                    padding: '40px', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 30px var(--color-shadow)'
                }}>
                    
                    {/* Role / Email Status */}
                    <div style={{borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px'}}>
                        <p style={{fontWeight: 600}}>Role: <span style={{color: 'var(--color-secondary)'}}>{roleLabel}</span></p>
                        <p style={{fontSize: '14px', color: 'var(--color-text-light)'}}>Email: {formData.email} (Cannot be changed)</p>
                    </div>

                    {/* Full Name */}
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Full Name</label>
                        <input type="text" style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} name="name" value={formData.name} onChange={onChange} required />
                    </div>

                    {/* NGO Name (Only for NGO role) */}
                    {user.role === 'ngo' && (
                        <div style={{marginBottom: '30px'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Organization Name</label>
                            <input type="text" style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} name="ngoName" value={formData.ngoName} onChange={onChange} required />
                        </div>
                    )}
                    
                    {/* Success/Error Message Display */}
                    {message && <div style={{color: 'white', backgroundColor: 'var(--color-success)', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{message}</div>}
                    {error && <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{error}</div>}

                    <button type="submit" className="btn-vibrant" style={{fontWeight: 'bold'}}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = ({ onEventCreated, onBack }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: 10,
        category: 'Community'
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const categories = ['Environment', 'Education', 'Health', 'Community', 'Other'];

    const { title, description, location, date, capacity, category } = formData;

    const onChange = e => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            await axios.post('/api/events', formData); 
            
            setSuccess(true);
            onEventCreated(); 

            setFormData({
                title: '', description: '', location: '', date: '', 
                capacity: 10, category: 'Community'
            });

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create event. Check required fields.');
        }
    };

    return (
        <div className="container-fluid" style={{padding: '30px 0'}}>
            <button onClick={onBack} style={{color: 'var(--color-primary)', display: 'block', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}>
                <i className="fas fa-arrow-left" style={{marginRight: '8px'}}></i> Back to Dashboard
            </button>
            
            <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                List New Opportunity
            </h1>
            <p style={{ color: 'var(--color-text-light)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                Digitize your event listing for volunteers.
            </p>

            <form onSubmit={onSubmit} style={{
                backgroundColor: 'var(--color-card-bg)', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 10px 30px var(--color-shadow)'
            }}>
                
                {/* Title */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Opportunity Title</label>
                    <input type="text" placeholder="e.g., Coastal Cleanup Drive" name="title" value={title} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                </div>
                
                {/* Description */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Description</label>
                    <textarea placeholder="Detailed description of the event and tasks..." name="description" value={description} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px'}}></textarea>
                </div>

                {/* Grid Layout for Location, Date, Capacity */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px'}}>
                    <div style={{marginBottom: '0'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Location</label>
                        <input type="text" placeholder="City or Specific Place" name="location" value={location} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                    </div>
                    
                    <div style={{marginBottom: '0'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Date & Time</label>
                        <input type="datetime-local" name="date" value={date} onChange={onChange} required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                    </div>

                    <div style={{marginBottom: '0'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Slots Needed</label>
                        <input type="number" name="capacity" value={capacity} onChange={onChange} min="1" required style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}} />
                    </div>
                </div>

                {/* Category */}
                <div style={{marginBottom: '30px', maxWidth: '300px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>Category</label>
                    <select name="category" value={category} onChange={onChange} style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}>
                        {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                
                {success && <div style={{color: 'white', backgroundColor: 'var(--color-success)', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>Event successfully created!</div>}
                {error && <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>Error: {error}</div>}

                <button type="submit" className="btn-vibrant" style={{fontWeight: 'bold', fontSize: '16px'}}>
                    List Event
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;
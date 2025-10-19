import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
    // Format date for clean display
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div style={{
            // ... (UI styles unchanged)
            minHeight: '320px'
        }}>
            <div>
                {/* Title */}
                <h3 style={{
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: 'var(--color-text)', 
                    marginBottom: '8px'
                }}>
                    {event.title}
                </h3>
                
                {/* NGO Name - FIX: Added optional chaining (?.) for robust rendering */}
                <p style={{
                    fontSize: '14px', 
                    color: 'var(--color-text-light)', 
                    marginBottom: '15px'
                }}>
                    Organized by: {event.ngo?.ngoName || 'N/A'}
                </p>

                {/* Details List */}
                <div style={{fontSize: '15px', color: 'var(--color-text)'}}>
                    <p style={{marginBottom: '5px', fontWeight: 600}}>
                        <i className="fas fa-tag" style={{color: 'var(--color-secondary)', marginRight: '8px'}}></i> Category: {event.category}
                    </p>
                    <p style={{marginBottom: '5px'}}>
                        <i className="fas fa-map-marker-alt" style={{color: '#dc3545', marginRight: '8px'}}></i> Location: {event.location}
                    </p>
                    <p style={{marginBottom: '5px'}}>
                        <i className="fas fa-calendar-alt" style={{color: 'var(--color-primary)', marginRight: '8px'}}></i> Date: {eventDate}
                    </p>
                    <p>
                        <i className="fas fa-users" style={{color: 'var(--color-success)', marginRight: '8px'}}></i> Slots Available: {event.capacity}
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <Link 
                to={`/events/${event._id}`} 
                className="btn-vibrant"
                style={{ 
                    marginTop: '20px', 
                    textAlign: 'center',
                    width: '100%',
                    display: 'block'
                }}
            >
                View Details & Apply
            </Link>
        </div>
    );
};

export default EventCard;
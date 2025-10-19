import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
// Assuming Link is used via EventCard

const EventBrowser = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location: ''
    });

    const { search, category, location } = filters;

    // FIX 1: Use useCallback to memoize the function. This is best practice for functions 
    // used as useEffect dependencies, preventing infinite loops and ensuring correct updates.
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX 2: Filter out empty search/category/location values.
            // This prevents sending redundant query parameters like "?search=&category=" 
            // which can sometimes confuse the server or clog logs.
            const validFilters = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== '')
            );
            
            const query = new URLSearchParams(validFilters).toString();
            
            // The API endpoint we confirmed works in server/routes/eventRoutes.js
            const res = await axios.get(`/api/events?${query}`); 
            
            setEvents(res.data);
        } catch (err) {
            console.error('Event Fetch Error Details:', err);
            // Provide a clear message, prioritizing the server's message
            const errMsg = err.response?.data?.msg || 'Failed to fetch events. Check server connection.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    }, [filters]); // fetchEvents only updates when the filters object changes

    // CRITICAL: useEffect now depends on the stable, memoized fetchEvents function.
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]); 

    const handleFilterChange = e => {
        // This update to the filters state will trigger a change in the fetchEvents function (due to useCallback)
        // which, in turn, triggers the useEffect hook to refetch data.
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const categories = ['Environment', 'Education', 'Health', 'Community', 'Other'];

    // UI Aesthetics (No changes needed, the style is clean and functional)
    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `linear-gradient(rgba(0, 77, 153, 0.7), rgba(0, 0, 0, 0.7)), url('https://source.unsplash.com/random/1600x600/?hands,community,sky')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}>
            <div className="container-fluid" style={{ padding: '80px 0' }}>
                {/* HERO TEXT */}
                <h1 style={{color: 'white', fontSize: '3.5rem', fontWeight: 'bold', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    Volunteer. Impact. Connect.
                </h1>
                <p style={{color: '#fff', fontSize: '1.2rem', opacity: 0.9, textAlign: 'center', marginBottom: '3rem'}}>
                    Your next mission is waiting. Browse verified NGO opportunities globally.
                </p>

                {/* --- Search and Filter Bar (High Contrast Box) --- */}
                <div style={{
                    backgroundColor: 'var(--color-card-bg)', 
                    padding: '20px 30px', 
                    borderRadius: '12px', 
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    maxWidth: '900px', 
                    margin: '0 auto 3rem auto',
                    display: 'flex', 
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <input type="text" placeholder="Search titles or descriptions..." name="search" value={search} onChange={handleFilterChange} style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', backgroundColor: 'var(--color-input-bg)'}} />
                    <select name="category" value={category} onChange={handleFilterChange} style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', backgroundColor: 'var(--color-input-bg)'}}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    <input type="text" placeholder="Filter by Location" name="location" value={location} onChange={handleFilterChange} style={{flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', backgroundColor: 'var(--color-input-bg)'}} />
                </div>
                {/* --- End Filter Bar --- */}
            </div>
            
            {/* Event List Section */}
            <div style={{ backgroundColor: 'var(--color-background)', padding: '40px 0', borderTop: '1px solid #ddd' }}>
                <div className="container-fluid">
                    <h2 style={{ color: 'var(--color-text)', fontSize: '2rem', marginBottom: '20px' }}>Opportunities Awaiting</h2>
                    
                    {loading && <p style={{textAlign: 'center'}}>Loading events...</p>}
                    {error && <p style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>Error: {error}</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        {!loading && events.length === 0 ? (
                            <p style={{padding: '15px', background: 'white', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)', color: 'var(--color-text)'}}>No events match your current filters.</p>
                        ) : (
                            events.map(event => (
                                <EventCard key={event._id} event={event} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventBrowser;
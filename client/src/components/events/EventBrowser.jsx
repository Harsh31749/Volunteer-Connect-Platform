import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from './EventCard';

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

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const validFilters = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== '')
            );
            
            const query = new URLSearchParams(validFilters).toString();
            
            const res = await axios.get(`/api/events?${query}`); 
            
            setEvents(res.data);
        } catch (err) {
            console.error('Event Fetch Error Details:', err);
            const errMsg = err.response?.data?.msg || 'Failed to fetch events. Check server connection.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    }, [filters]); 

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]); 

    const handleFilterChange = e => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const categories = ['Environment', 'Education', 'Health', 'Community', 'Other'];
    
    const inputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm bg-gray-50";

    return (
        <div className="min-h-screen">
            <div 
                className="relative bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 77, 153, 0.7), rgba(0, 0, 0, 0.7)), url('https://source.unsplash.com/random/1600x600/?hands,community,sky')`,
                }}
            >
                <div className="container mx-auto px-4 py-20 lg:py-32">
                    {/* HERO TEXT */}
                    <h1 className="text-white text-4xl lg:text-5xl font-extrabold text-center drop-shadow-lg">
                        Volunteer. Impact. Connect.
                    </h1>
                    <p className="text-white text-lg lg:text-xl opacity-90 text-center mb-12">
                        Your next mission is waiting. Browse verified NGO opportunities globally.
                    </p>

                    {/* --- Search and Filter Bar (Modern Card) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto border-b-4 border-indigo-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <input 
                                type="text" 
                                placeholder="Search titles or descriptions..." 
                                name="search" 
                                value={search} 
                                onChange={handleFilterChange} 
                                className={inputStyle}
                            />
                            
                            {/* Category Select */}
                            <select 
                                name="category" 
                                value={category} 
                                onChange={handleFilterChange} 
                                className={inputStyle + " appearance-none"}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                            
                            {/* Location Input */}
                            <input 
                                type="text" 
                                placeholder="Filter by Location" 
                                name="location" 
                                value={location} 
                                onChange={handleFilterChange} 
                                className={inputStyle} 
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Event List Section */}
            <div className="bg-gray-50 py-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
                        Opportunities Awaiting
                    </h2>
                    
                    {/* Status/Error Messages */}
                    {loading && <p className="text-center text-gray-500 py-10">Loading events...</p>}
                    {error && (
                        <div className="rounded-lg bg-red-100 p-4 border-l-4 border-red-500 text-red-700 font-medium mb-4">
                            Error: {error}
                        </div>
                    )}

                    {/* Event Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {!loading && events.length === 0 ? (
                            <div className="col-span-full p-6 bg-white rounded-lg border-l-4 border-indigo-500 shadow-md">
                                <p className="text-gray-700">
                                    No events match your current filters. Try broadening your search!
                                </p>
                            </div>
                        ) : (
                            // EventCard uses the refactored Tailwind styles from Step 1
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
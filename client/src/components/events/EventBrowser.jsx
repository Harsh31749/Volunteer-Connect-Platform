import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import toast from 'react-hot-toast';

const backgroundImages = [
  '/image/homepage.png',
  '/image/home-page.png',
  '/image/home--page.png',
];

const SLIDE_DURATION = 7000;
const FADE_DURATION = 1000;

const EventBrowser = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', location: '' });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [isNextImageLoaded, setIsNextImageLoaded] = useState(false);

  const { search, category, location } = filters;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Remove empty filters
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const query = new URLSearchParams(validFilters).toString();

      const res = await axios.get(`/api/events?${query}`); // Adjust if backend returns { events: [...] }
      setEvents(res.data?.events || res.data || []); // Safe fallback
    } catch (err) {
      console.error(err);
      toast.error(err);
      setError(err.response?.data?.msg || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Slideshow preload next image
  useEffect(() => {
    setIsNextImageLoaded(false);
    const img = new Image();
    img.src = backgroundImages[nextImageIndex];
    img.onload = () => setIsNextImageLoaded(true);
    img.onerror = () => setIsNextImageLoaded(true);
  }, [nextImageIndex]);

  // Slideshow interval
  useEffect(() => {
    if (!isNextImageLoaded) return;

    const interval = setInterval(() => {
      setIsFading(true);
      const timeout = setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % backgroundImages.length);
        setIsFading(false);
      }, FADE_DURATION);

      return () => clearTimeout(timeout);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isNextImageLoaded, nextImageIndex]);

  const handleFilterChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const categories = ['Environment', 'Education', 'Health', 'Community', 'Other'];
  const inputStyle =
    'w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ' +
    'transition duration-150 ease-in-out shadow-sm bg-gray-50';

  const currentImageUrl = backgroundImages[currentImageIndex];
  const nextImageUrl = backgroundImages[nextImageIndex];

  return (
    <div className="min-h-screen">
      {/* Slideshow hero */}
      <div className="relative h-[75vh]">
        <img src={nextImageUrl} alt="Next" className="absolute inset-0 w-full h-full object-cover z-5" />
        <img
          src={currentImageUrl}
          alt="Current"
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-[1000ms] ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div
          className="absolute inset-0 z-20"
          style={{ backgroundImage: 'linear-gradient(rgba(0,77,153,0.7), rgba(0,0,0,0.7))' }}
        />

        <div className="relative container mx-auto px-4 py-20 lg:py-32 z-30 h-full flex flex-col justify-center text-center">
          <h1 className="text-white text-4xl lg:text-5xl font-extrabold drop-shadow-lg">
            Volunteer. Impact. Connect.
          </h1>
          <p className="text-white text-lg lg:text-xl opacity-90 mb-12">
            Your next mission is waiting. Browse verified NGO opportunities globally.
          </p>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto border-b-4 border-indigo-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search titles or descriptions..."
                name="search"
                value={search}
                onChange={handleFilterChange}
                className={inputStyle}
              />
              <select
                name="category"
                value={category}
                onChange={handleFilterChange}
                className={inputStyle + ' appearance-none'}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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

      {/* Events Section */}
      <div className="bg-gray-50 py-10" id="opportunities-awaiting">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
            Opportunities Awaiting
          </h2>

          {loading && <p className="text-center text-gray-500 py-10">Loading events...</p>}
          {error && (
            <div className="rounded-lg bg-red-100 p-4 border-l-4 border-red-500 text-red-700 font-medium mb-4">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-32">
            {!loading && events.length === 0 ? (
              <div className="col-span-full p-6 bg-white rounded-lg border-l-4 border-indigo-500 shadow-md">
                <p className="text-gray-700">No events match your current filters. Try broadening your search!</p>
              </div>
            ) : (
              events.map(event => <EventCard key={event._id} event={event} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBrowser;

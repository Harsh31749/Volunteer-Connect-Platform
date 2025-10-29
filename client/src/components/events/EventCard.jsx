import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  const date = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white p-6 shadow-xl rounded-xl transition duration-300 hover:shadow-2xl flex flex-col justify-between"
             style={{ minHeight: '320px' }}>
      
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-snug line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm font-medium text-indigo-600 mt-1">
            Organized by: {event.ngo?.ngoName || 'N/A'}
          </p>
        </div>

        {/* Details List */}
        <div className="text-base text-gray-700 space-y-3">
            {/* Category */}
            <p className="flex items-center">
                <i className="fas fa-tag text-indigo-500 mr-3 w-4 h-4 text-center"></i> 
                <span className="font-semibold">Category: </span> {event.category}
            </p>
            {/* Location */}
            <p className="flex items-center">
                <i className="fas fa-map-marker-alt text-red-500 mr-3 w-4 h-4 text-center"></i> 
                <span className="font-semibold">Location: </span> {event.location}
            </p>
            {/* Date */}
            <p className="flex items-center">
                <i className="fas fa-calendar-alt text-blue-500 mr-3 w-4 h-4 text-center"></i> 
                <span className="font-semibold">Date: </span> {date}
            </p>
            {/* Slots */}
            <p className="flex items-center">
                <i className="fas fa-users text-green-500 mr-3 w-4 h-4 text-center"></i> 
                <span className="font-semibold">Slots Available: </span> {event.capacity}
            </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <Link 
          to={`/events/${event._id}`}
          className="block w-full text-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          View Details & Apply
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
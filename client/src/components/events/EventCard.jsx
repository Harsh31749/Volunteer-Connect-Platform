import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faMapMarkerAlt, faCalendarAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

const categoryBackgrounds = {
  Environment: '/image/environment.png',
  Education: '/image/education.png',
  Health: '/image/health.png',
  Community: '/image/community.jpeg',
  Other: '/image/other.png',
};

export default function EventCard({ event }) {
  if (!event) return null;

  const date = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const backgroundImage = categoryBackgrounds[event.category] || categoryBackgrounds.Other;

  return (
    <div
      className="relative shadow-xl rounded-xl overflow-hidden transition duration-300 hover:shadow-2xl"
      style={{ width: '288px', height: '512px' }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col h-full p-4 text-white">
        {/* Title & NGO */}
        <div>
          <h3 className="text-[#FF6B35] font-bold text-4xl mb-1 line-clamp-2">
            {event.title || 'Untitled Event'}
          </h3>
          <p className="text-[#F0F0F0] text-lg">
            Organized by: {event.ngo?.ngoName || 'N/A'}
          </p>
        </div>

        <div className="flex-grow" />

        <div className="mt-auto bg-green-100/30 backdrop-blur-md rounded-lg p-2">
        <p className="flex items-center mb-1">
          <FontAwesomeIcon icon={faTag} className="mr-2 text-[#007B80]" />
          <span className="text-[#007B80] font-semibold">
            Category: {(event.category || 'Other').charAt(0).toUpperCase() + (event.category || 'Other').slice(1).toLowerCase()}
          </span>
        </p>
        <p className="flex items-center mb-1">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#5B9AD9]" />
          <span className="text-[#5B9AD9] font-semibold">
            Location: {(event.location || 'N/A').charAt(0).toUpperCase() + (event.location || 'N/A').slice(1).toLowerCase()}
          </span>
        </p>
        <p className="flex items-center mb-1">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#7A378B]" />
          <span className="text-[#7A378B] font-semibold">Date: {date}</span>
        </p>
        <p className="flex items-center mb-2">
          <FontAwesomeIcon icon={faUsers} className="mr-2 text-[#FFC72C]" />
          <span className="text-[#FFC72C] font-semibold">Slots Available: {event.capacity ?? 'N/A'}</span>
        </p>


          <Link
            to={`/events/${event._id}`}
            className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold mt-2   hover:bg-indigo-700 hover:scale-105 hover:shadow-lg transition duration-200"
          >
            View Details & Apply
          </Link>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageVolunteers = ({ eventId, onBack }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/events/${eventId}/registrations`);
                setRegistrations(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch registrations for this event.');
                console.error('API Error:', err);
                toast.error('API Error:', err);
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
            await axios.put(`/api/registrations/${registrationId}/verify`);
            toast.success('Attendance verified! Certificate email sent.');
            
            setRegistrations(regs => 
                regs.map(reg => 
                    reg._id === registrationId ? { ...reg, status: 'Attended' } : reg
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Verification failed.');
        }
    };


    if (loading) return (
        <div className="flex justify-center items-center h-48">
            <h2 className="text-xl text-gray-700">Loading volunteer list...</h2>
        </div>
    );
    
    if (error) return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
        </div>
    );

return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            
            <button 
                onClick={onBack} 
                className="flex items-center mb-6 text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium bg-transparent border-none p-0 cursor-pointer"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Event List
            </button>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                Volunteer Sign-Ups
            </h1>
            <p className="text-lg text-gray-500 mb-6">
                Total Registered: <span className="font-bold text-gray-900">{registrations.length}</span>
            </p>

            {registrations.length === 0 ? (
                <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-inner">
                    <p className="text-yellow-800">
                        No volunteers have signed up for this event yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registrations.map(reg => {
                        const isAttended = reg.status === 'Attended';
                        const borderColor = isAttended ? 'border-green-500' : 'border-indigo-500';
                        const statusColor = isAttended ? 'text-green-600' : 'text-orange-600';

                        return (
                            <div 
                                key={reg._id} 
                                className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${borderColor} 
                                            flex flex-col justify-between space-y-4 transition duration-200 hover:shadow-xl`}
                            >
                                <div className="flex-grow">
                                    <p className="font-semibold text-lg text-gray-900">
                                        {reg.volunteer.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {reg.volunteer.email}
                                    </p>
                                    <p className="text-sm font-semibold mt-3">
                                        Status: 
                                        <span className={`font-bold ${statusColor}`}>
                                            {' ' + reg.status}
                                        </span>
                                    </p>
                                </div>

                                {isAttended ? (
                                    <span className="inline-flex items-center text-green-600 font-bold text-sm bg-green-100 p-2 rounded-full justify-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                        VERIFIED
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleVerify(reg._id)} 
                                        className="w-full inline-flex justify-center items-center bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Verify Attendance
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ManageVolunteers;
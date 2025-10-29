import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CertificateVerifier = () => {
    const [regId, setRegId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        setError(null);
        setLoading(true);

        if (!regId) {
            setLoading(false);
            return setError("Please enter a Verification ID.");
        }

        try {
            // API call remains untouched
            const res = await axios.get(`/api/events/verify-certificate/${regId}`);
            setResult(res.data);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Verification failed. Server communication error.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm";

    const renderResult = () => {
        if (!result) return null;

        const volunteerName = result.details?.volunteerName || 'N/A';
        const eventTitle = result.details?.eventTitle || 'N/A';
        const organizedBy = result.details?.organizedBy || 'N/A'; 
        
        const eventDate = result.details?.eventDate ? new Date(result.details.eventDate).toDateString() : 'N/A';

        if (result.isValid) {
            return (
                <div className="p-6 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-lg shadow-lg mt-6">
                    <div className="flex items-center mb-2">
                        {/* SVG replacement for checkmark icon */}
                        <svg className="h-6 w-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        <h4 className="font-bold text-xl">Verification Successful</h4>
                    </div>
                    <p className="mb-4 text-green-700">This certificate is **VALID** and was issued by the Volunteer Connect Platform.</p>
                    <ul className="list-none p-0 text-sm space-y-1">
                        <li><strong>Volunteer:</strong> <span className="font-medium">{volunteerName}</span></li>
                        <li><strong>Event:</strong> <span className="font-medium">{eventTitle}</span></li>
                        <li><strong>Date:</strong> <span className="font-medium">{eventDate}</span></li>
                        <li><strong>Organization:</strong> <span className="font-medium">{organizedBy}</span></li>
                    </ul>
                </div>
            );
        } else {
            return (
                <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg shadow-lg mt-6">
                    <div className="flex items-center mb-2">
                        {/* SVG replacement for warning icon */}
                        <svg className="h-6 w-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        <h4 className="font-bold text-xl">Verification Failed</h4>
                    </div>
                    <p className="text-red-700 mb-2">{result.msg}</p>
                    {result.details?.registrationStatus && <p className="text-sm text-red-700">Status on Record: <strong>{result.details.registrationStatus}</strong></p>}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl"> 
                
                {/* Back Link */}
                <Link 
                    to="/" 
                    className="flex items-center mb-6 text-gray-500 hover:text-indigo-600 transition duration-150 font-medium"
                >
                    {/* SVG replacement for fas fa-arrow-left */}
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Homepage
                </Link>

                {/* Main Card */}
                <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Certificate Verification Portal
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Enter the unique ID found on the digital certificate to confirm its authenticity.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Verification ID Input */}
                        <div>
                            <label htmlFor="regId" className="block text-sm font-medium text-gray-700 mb-2">
                                Verification ID:
                            </label>
                            <input
                                id="regId"
                                type="text"
                                className={inputStyle}
                                placeholder="Paste the unique Registration ID here..."
                                value={regId}
                                onChange={(e) => setRegId(e.target.value)}
                                required
                            />
                        </div>
                        
                        {/* Error Message Display */}
                        {error && (
                            <div className="rounded-md bg-red-100 p-3 border-l-4 border-red-500 text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full flex justify-center py-3 px-4 border border-transparent 
                                       rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 
                                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Certificate'
                            )}
                        </button>
                    </form>
                    
                    {/* Verification Result Area */}
                    {renderResult()}
                </div>
            </div>
        </div>
    );
};

export default CertificateVerifier;
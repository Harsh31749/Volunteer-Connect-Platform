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
            // Public API call to GET /api/events/verify-certificate/:regId
            const res = await axios.get(`/api/events/verify-certificate/${regId}`);
            setResult(res.data);
        } catch (err) {
            // Handle 404s and server errors gracefully
            const msg = err.response?.data?.msg || 'Verification failed. Server communication error.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;

        if (result.isValid) {
            return (
                <div style={{ padding: '20px', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '8px', marginTop: '25px', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.5)' }}>
                    <h4 style={{marginBottom: '10px', fontSize: '1.5rem'}}>✅ Verification Successful</h4>
                    <p style={{marginBottom: '15px'}}>This certificate is **VALID** and was issued by the Volunteer Connect Platform.</p>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        <li><strong>Volunteer:</strong> {result.details.volunteerName}</li>
                        <li><strong>Event:</strong> {result.details.eventTitle}</li>
                        <li><strong>Date:</strong> {new Date(result.details.eventDate).toDateString()}</li>
                        <li><strong>Organization:</strong> {result.details.ngoName}</li>
                    </ul>
                </div>
            );
        } else {
            return (
                <div style={{ padding: '20px', backgroundColor: '#dc3545', color: 'white', borderRadius: '8px', marginTop: '25px' }}>
                    <h4 style={{marginBottom: '10px', fontSize: '1.5rem'}}>⚠️ Verification Failed</h4>
                    <p>{result.msg}</p>
                    {result.registrationStatus && <p>Status on Record: **{result.registrationStatus}**</p>}
                </div>
            );
        }
    };

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingTop: '5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="container" style={{maxWidth: '650px', width: '100%'}}> 
                <Link to="/" style={{color: 'var(--color-text-light)', marginBottom: '30px', display: 'block', fontSize: '14px'}}>
                    <i className="fas fa-arrow-left" style={{marginRight: '8px'}}></i> Back to Homepage
                </Link>

                <div style={{backgroundColor: 'var(--color-card-bg)', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px var(--color-shadow)'}}>
                    <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Certificate Verification Portal</h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                        Enter the unique ID found on the digital certificate to confirm its authenticity.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Verification ID:</label>
                            <input
                                type="text"
                                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px'}}
                                placeholder="Paste the unique Registration ID here..."
                                value={regId}
                                onChange={(e) => setRegId(e.target.value)}
                                required
                            />
                        </div>
                        
                        {error && <div style={{color: 'white', backgroundColor: '#dc3545', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>{error}</div>}

                        <button 
                            type="submit" 
                            className="btn-vibrant" 
                            style={{ width: '100%', fontWeight: 'bold' }}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Certificate'}
                        </button>
                    </form>
                    
                    {renderResult()}
                </div>
            </div>
        </div>
    );
};

export default CertificateVerifier;
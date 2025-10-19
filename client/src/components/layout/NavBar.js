import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinkStyle = { 
        padding: '0 15px', 
        fontSize: '15px', 
        fontWeight: 600,
        color: 'var(--color-text)'
    };
    const buttonStyle = { 
        padding: '8px 16px', 
        borderRadius: '4px',
        fontWeight: 600,
        transition: 'background-color 0.2s'
    };

    return (
        <nav style={{
            backgroundColor: 'var(--color-card-bg)', 
            boxShadow: '0 2px 10px var(--color-shadow)', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center',
            position: 'fixed', 
            top: 0, 
            width: '100%', 
            zIndex: 100 
        }}>
            <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'var(--color-primary)', fontSize: '20px', fontWeight: 700 }}>
                    <i className="fas fa-hands-helping" style={{ marginRight: '8px' }}></i> Volunteer Connect
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Dynamic Links */}
                    {user ? (
                        <>
                            {user.role === 'volunteer' && <Link style={navLinkStyle} to="/dashboard/volunteer">Dashboard</Link>}
                            {user.role === 'ngo' && <Link style={navLinkStyle} to="/dashboard/ngo">Host Panel</Link>}
                            <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#f0f0f0', color: 'var(--color-text)' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link style={{ ...buttonStyle, border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }} to="/login">Login</Link>
                            <Link style={{ ...buttonStyle, backgroundColor: 'var(--color-secondary)', color: 'white' }} to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar; 
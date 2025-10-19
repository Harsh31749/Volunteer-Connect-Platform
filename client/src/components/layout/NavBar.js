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

    // Removed navLinkStyle and buttonStyle objects

    return (
        // Replaced inline styles with 'navbar-container' class
        <nav className="navbar-container">
            {/* Replaced inline styles with 'navbar-content' class */}
            <div className="container-fluid navbar-content">
                {/* Replaced inline styles with 'brand-link' and 'brand-icon' classes */}
                <Link to="/" className="brand-link">
                    <i className="fas fa-hands-helping brand-icon"></i> Volunteer Connect
                </Link>

                {/* Replaced inline styles with 'nav-links-group' class */}
                <div className="nav-links-group">
                    {/* Dynamic Links */}
                    {user ? (
                        <>
                            {/* Using the new 'nav-link' and 'btn-base' classes */}
                            {user.role === 'volunteer' && <Link className="nav-link" to="/dashboard/volunteer">Dashboard</Link>}
                            {user.role === 'ngo' && <Link className="nav-link" to="/dashboard/ngo">Host Panel</Link>}
                            {/* Combined btn-base with btn-light-neutral */}
                            <button onClick={handleLogout} className="btn-base btn-light-neutral">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Combined btn-base with btn-primary-outline and btn-secondary */}
                            <Link className="btn-base btn-primary-outline" to="/login">Login</Link>
                            <Link className="btn-base btn-secondary" to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
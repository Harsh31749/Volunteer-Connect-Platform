import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    const auth = useAuth() || {};  // safely fallback if undefined
    const { user, logout } = auth;
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logout) {
            logout();
            navigate('/');
        }
    };

    return (
        <nav className="navbar-container">
            <div className="container-fluid navbar-content">
                <Link to="/" className="brand-link">
                    <i className="fas fa-hands-helping brand-icon"></i> Volunteer Connect
                </Link>

                <div className="nav-links-group">
                    {user ? (
                        <>
                            {user.role === 'volunteer' && <Link className="nav-link" to="/dashboard/volunteer">Dashboard</Link>}
                            {user.role === 'ngo' && <Link className="nav-link" to="/dashboard/ngo">Host Panel</Link>}
                            <button onClick={handleLogout} className="btn-base btn-light-neutral">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
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

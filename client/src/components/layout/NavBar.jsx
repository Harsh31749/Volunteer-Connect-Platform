import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    // Safely destructure context and set up state for mobile menu
    const { user, logout } = useAuth() || {};
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logout) {
            logout();
            navigate('/');
        }
        setIsOpen(false); // Close menu on logout
    };
    
    // Determine the user's main dashboard path
    const dashboardPath = user?.role === 'volunteer' ? '/dashboard/volunteer' : 
                          user?.role === 'ngo' ? '/dashboard/ngo' : null;

    const desktopLinkStyle = "text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150";
    const mobileLinkStyle = "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition duration-150";
    
return (
        <nav className="bg-white shadow-lg sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand / Logo (Kept w-6 h-6 for prominence) */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center text-xl font-extrabold text-indigo-600 hover:text-indigo-700">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>
                            Volunteer Connect
                        </Link>
                    </div>

                    {/* Desktop Navigation & Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        
                        {/* Main Links */}
                        <Link to="/" className={desktopLinkStyle}>
                            Events
                        </Link>

                        {user && dashboardPath && (
                            <Link to={dashboardPath} className={desktopLinkStyle + " text-indigo-600"}>
                                {user.role === 'volunteer' ? 'Dashboard' : 'Host Panel'}
                            </Link>
                        )}
                        
                        {/* Auth/Logout Buttons */}
                        {user ? (
                            <button 
                                onClick={handleLogout} 
                                className="text-sm font-medium text-red-600 hover:text-red-700 ml-4 py-2 px-3 focus:outline-none"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link 
                                    to="/login" 
                                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-sm"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

{/* Mobile Menu Button (Reduced from w-6 h-6 to w-5 h-5 for better aesthetic) */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition duration-150"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {isOpen && (
                <div className="lg:hidden bg-white shadow-xl">
                    <div className="pt-2 pb-3 space-y-1">
                        
                        {/* Main Links (Mobile) */}
                        <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkStyle}>
                            Events
                        </Link>

                        {user && dashboardPath && (
                            <Link to={dashboardPath} onClick={() => setIsOpen(false)} className={mobileLinkStyle + " text-indigo-600 font-bold"}>
                                {user.role === 'volunteer' ? 'Dashboard' : 'Host Panel'}
                            </Link>
                        )}
                        
                        {/* Auth/Logout Buttons (Mobile) */}
                        {!user ? (
                            <div className="flex flex-col space-y-2 p-2 pt-4">
                                <Link 
                                    to="/login" 
                                    onClick={() => setIsOpen(false)} 
                                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={() => setIsOpen(false)} 
                                    className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavBar;
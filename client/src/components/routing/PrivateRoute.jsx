import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // MODIFIED: Import useLocation
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
    const { user, loading } = useAuth();
    const location = useLocation(); // NEW: Hook to get current URL path

    if (loading) {
        // Use a less intrusive loading indicator if possible, or a more permanent placeholder
        return <div>Loading authentication state...</div>; 
    }

    // ---------------------------------------------
    // 1. Check Authentication Status
    // ---------------------------------------------
    if (!user) {
        // MODIFIED: Redirect to /login, passing the current location in state
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ---------------------------------------------
    // 2. Check Role Authorization
    // ---------------------------------------------
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // MODIFIED: Redirect the unauthorized user to their correct, authorized dashboard.
        // This avoids the confusing "unauthorized loop" and provides a better user experience.
        const dashboardPath = user.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/volunteer';
        console.warn(`Access denied for role '${user.role}' to path '${location.pathname}'. Redirecting to authorized dashboard.`);

        // Redirect to their correct, authorized dashboard
        return <Navigate to={dashboardPath} replace />; 
    }
    
    // ---------------------------------------------
    // 3. User is Authenticated and Authorized
    // ---------------------------------------------
    return <Component {...rest} />;
};

export default PrivateRoute;
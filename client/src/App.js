import React from 'react';
import './index.css';
// NOTE: Assuming global index.css now contains Tailwind directives, 
// so no need to explicitly remove index.css if it's correctly set up.
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/layout/NavBar';
import PrivateRoute from './components/routing/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EventBrowser from './components/events/EventBrowser'; 
import EventDetails from './components/events/EventDetails';
import VolunteerDashboard from './components/dashboard/VolunteerDashboard'; 
import NGODashboard from './components/dashboard/NGODashboard';
import ProfileSettings from './components/profile/ProfileSettings';
import CertificateVerifier from './components/profile/CertificateVerifier';
import SocialLoginSuccess from './components/auth/SocialLoginSuccess'; 


function App() {
    // The main container div now simply wraps the routes.
    // Padding/margins are handled by the components themselves or 
    // removed completely if not necessary due to sticky navbar.
    // The previous CSS classes like 'fixed-navbar-offset' and 'container-fluid' are removed.

    return (
        <div className="bg-gray-50 min-h-screen">
            <NavBar />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<EventBrowser />} /> 
                    <Route path="/events/:id" element={<EventDetails />} /> 
                    <Route path="/verify" element={<CertificateVerifier />} />
                    <Route path="/social-login-success" element={<SocialLoginSuccess />} /> 
                    
                    {/* Private Routes (Protected by role) */}
                    <Route path="/settings" element={<PrivateRoute component={ProfileSettings} allowedRoles={['volunteer', 'ngo']} />} />
                    <Route path="/dashboard/volunteer" element={<PrivateRoute component={VolunteerDashboard} allowedRoles={['volunteer']} />} />
                    <Route path="/dashboard/ngo" element={<PrivateRoute component={NGODashboard} allowedRoles={['ngo']} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
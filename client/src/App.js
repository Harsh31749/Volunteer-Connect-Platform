import React from 'react';
import './index.css';
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

function App() {
 
 return (
    <>
      <NavBar />
      {/* FIX: This container pushes all content down 60px to clear the fixed NavBar */}
      <div style={{ paddingTop: '60px' }}>
        <div className="container-fluid"> {/* Max-width container for content */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<EventBrowser />} /> 
            <Route path="/events/:id" element={<EventDetails />} /> 
            <Route path="/verify" element={<CertificateVerifier />} />
            
            {/* Private Routes (Protected by role) */}
            <Route path="/settings" element={<PrivateRoute component={ProfileSettings} allowedRoles={['volunteer', 'ngo']} />} />
            <Route path="/dashboard/volunteer" element={<PrivateRoute component={VolunteerDashboard} allowedRoles={['volunteer']} />} />
            <Route path="/dashboard/ngo" element={<PrivateRoute component={NGODashboard} allowedRoles={['ngo']} />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
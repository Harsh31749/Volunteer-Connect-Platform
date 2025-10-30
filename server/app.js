// app.js (The Express Application Definition)

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

// 💡 IMPORTANT: Ensure these files exist relative to where this file is run
// (They must be included in your final deployment structure)
const User = require('./models/User');
// Require all your route files
require('./routes/userRoutes'); 
require('./routes/volunteerRoutes'); 
// ... and others ...

// Environment variables must be handled outside or at the start of the function
// require('dotenv').config(); // <-- Handled by Netlify's environment variables

const app = express();

// --- Configuration/Middleware/Routes ---

// Database connection logic moved to function (or handler) scope if needed, 
// but often better handled outside the app definition if using Mongoose. 
// We will address Mongoose connection persistence separately.

app.use(express.json());

// Session and Passport setup
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Strategy, Serializer/Deserializer (Keep as is)
// ... [Place your existing passport setup code here] ...

// Route Definitions
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/ngo', require('./routes/ngoRoutes'));

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // 💡 Update redirect URL to your Netlify/frontend domain
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.redirect(`https://YOUR-NETLIFY-SITE.netlify.app/social-login-success?token=${token}`);
  }
);

module.exports = app;
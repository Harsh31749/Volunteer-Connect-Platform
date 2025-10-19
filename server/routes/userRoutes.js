const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
// Removed explicit 'bcrypt' import: Hashing is now handled automatically in the User model pre-save hook.

// GET /api/users/google (Google OAuth initiation)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// GET /api/users/google/callback (Google OAuth callback)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Using environment variable for frontend redirect
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${redirectUrl}/dashboard`);
  }
);

// ----------------------------------------------------------------
// POST /api/users/register (Local User Registration)
// ----------------------------------------------------------------
router.post('/register', async (req, res) => {
    const { name, email, password, role, ngoName } = req.body;

    try {
        // Input validation (basic check for required fields)
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields: name, email, and password.' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        // Create New User Document (Passing RAW password for middleware to hash)
        user = new User({
            name,
            email,
            password, 
            role: role || 'volunteer',
            ...(role === 'ngo' && { ngoName }) 
        });

        // Hashing occurs automatically via pre('save') middleware
        await user.save();

        // Generate JWT Token for immediate login
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ msg: 'Server Error during registration.', error: err.message });
    }
});

// ----------------------------------------------------------------
// NEW ROUTE: POST /api/users/login (Local User Login)
// ----------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check for missing credentials
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields: email and password.' });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Compare password hash using the helper method from the User model
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 4. Generate and return JWT token upon success
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server Error during login.', error: err.message });
    }
});


module.exports = router;
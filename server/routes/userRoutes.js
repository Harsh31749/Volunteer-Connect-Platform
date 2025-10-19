const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const { OAuth2Client } = require('google-auth-library'); // For verifying client-side ID tokens

// ----------------------------------------------------------------
// NEW ROUTE: POST /api/users/google-login (Client-side Google Login)
// ----------------------------------------------------------------
router.post('/google-login', async (req, res) => {
    const { token: idToken } = req.body;
    
    // Use the client ID from environment variable
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
    const client = new OAuth2Client(CLIENT_ID);
    
    try {
        if (!idToken) {
            return res.status(400).json({ msg: 'Google ID Token is missing.' });
        }

        // 1. Verify the Google ID Token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID, // Audience must match your client ID for security
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        // 2. Find or Create user
        let user = await User.findOne({ email });

        if (!user) {
            // New user registration defaults to 'volunteer' role
            user = new User({ name, email, role: 'volunteer' });
            // Since this is Google Auth, we won't have a password for the local strategy
            await user.save(); 
        }

        // 3. Generate application JWT
        const appPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            appPayload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                // 4. Return application JWT and user data to client
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error('Google Login processing error:', err.message);
        // Provide a clearer error message for the client
        if (err.message.includes('Token used too early') || err.message.includes('Token used too late') || err.message.includes('Invalid token signature')) {
             return res.status(401).json({ msg: 'Social Login Failed: Invalid or expired Google token.' });
        }
        res.status(500).json({ msg: 'Server Error during Google login processing.', error: err.message });
    }
});


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
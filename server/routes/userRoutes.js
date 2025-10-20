const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth'); 

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '5 days' }
    );
};


// ----------------------------------------------------------------
// POST /api/users/google-login (Client-side ID Token verification)
// ----------------------------------------------------------------
router.post('/google-login', async (req, res) => {
    const { token: idToken } = req.body;
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
    const client = new OAuth2Client(CLIENT_ID);
    
    try {
        if (!idToken) return res.status(400).json({ msg: 'Google ID Token is missing.' });

        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, role: 'volunteer' });
            await user.save(); 
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, ngoName: user.ngoName } });

    } catch (err) {
        console.error('Google Login processing error:', err.message);
        res.status(500).json({ msg: 'Server Error during Google login processing.', error: err.message });
    }
});


// ----------------------------------------------------------------
// POST /api/users/register (Local User Registration)
// ----------------------------------------------------------------
router.post('/register', async (req, res) => {
    const { name, email, password, role, ngoName } = req.body;

    try {
        if (!name || !email || !password) return res.status(400).json({ msg: 'Please enter all required fields: name, email, and password.' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        user = new User({
            name, email, password, 
            role: role || 'volunteer',
            ...(role === 'ngo' && { ngoName }) 
        });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, ngoName: user.ngoName } });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ msg: 'Server Error during registration.', error: err.message });
    }
});

// ----------------------------------------------------------------
// POST /api/users/login (Local User Login)
// ----------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields: email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, ngoName: user.ngoName } });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server Error during login.', error: err.message });
    }
});

// ----------------------------------------------------------------
// GET /api/users/profile (Fetch current user's full profile)
// ----------------------------------------------------------------
// This route is necessary for the client's AuthContext to rehydrate the full user object
router.get('/profile', auth, async (req, res) => { 
    try {
        // req.user contains {id, email} from the token payload
        const user = await User.findById(req.user.id).select('-password'); 

        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        res.json(user);
    } catch (err) {
        console.error('Profile fetch error:', err.message);
        res.status(500).send('Server Error');
    }
});


// ----------------------------------------------------------------
// PUT /api/users/profile (Update Name and/or NGO Name)
// ----------------------------------------------------------------
router.put('/profile', auth, async (req, res) => {
    const { name, ngoName } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;

    if (req.user.role === 'ngo') {
        if (!ngoName) return res.status(400).json({ msg: 'Organization Name is required for NGO accounts.' });
        updateFields.ngoName = ngoName;
    }

    try {
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ msg: 'No valid fields provided for update.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true, select: '-password' }
        );

        if (!user) return res.status(404).json({ msg: 'User not found.' });
        
        res.json({ 
            name: user.name, 
            email: user.email, 
            ngoName: user.ngoName,
            role: user.role,
            msg: 'Profile updated successfully.' 
        });
    } catch (err) {
        console.error('Profile update error:', err.message);
        if (err.name === 'ValidationError') return res.status(400).json({ msg: err.message });
        res.status(500).json({ msg: 'Server Error during profile update.' });
    }
});


module.exports = router;

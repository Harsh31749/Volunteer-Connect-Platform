const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); 

// Apply authentication and role restriction to ALL routes in this file
router.use(auth, (req, res, next) => {
    if (req.user.role !== 'ngo') {
        return res.status(403).json({ msg: 'Access denied. NGO role required.' });
    }
    next();
});

// GET /api/ngo/events - Get all events owned by the authenticated NGO
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find({ ngo: req.user.id }).sort({ date: -1 });
        res.json(events);
    } catch (err) { 
        // Improved error handling
        console.error('NGO event fetch error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching events.', error: err.message });
    }
});

// PUT /api/ngo/events/:eventId - Update a specific event owned by the NGO
router.put('/events/:eventId', async (req, res) => {
    // MODIFIED: Dynamically build the update object to handle any field passed in req.body
    const updateFields = {};
    const allowedFields = ['title', 'description', 'location', 'date', 'capacity', 'category', 'status']; 
    
    // Iterate over allowed fields and add them to the update object if present in request body
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field];
        }
    }
    
    // If no update fields are present, respond with 400 Bad Request
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ msg: 'No valid fields provided for update.' });
    }

    try {
        // Use findOneAndUpdate with the NGO ID in the query to enforce authorization
        let event = await Event.findOneAndUpdate(
            { _id: req.params.eventId, ngo: req.user.id },
            { $set: updateFields },
            { new: true, runValidators: true } // Return the updated document and run Mongoose schema validation
        );

        if (!event) {
            // This case covers both 404 (ID not found) and 403 (ID found, but not owned by NGO)
            return res.status(404).json({ msg: 'Event not found or unauthorized.' });
        }

        res.json({ msg: 'Event updated successfully.', event });
    } catch (err) { 
        // Improved error handling
        console.error('Event update error:', err.message);
        // MongoDB validation errors should return 400
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        res.status(500).json({ msg: 'Server Error during event update.', error: err.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); 

router.use(auth, (req, res, next) => {
    // req.user.role is available due to previous fix in auth.js
    if (req.user.role !== 'ngo') {
        return res.status(403).json({ msg: 'Access denied. NGO role required.' });
    }
    next();
});

// GET /api/ngo/events - Get all events owned by the authenticated NGO
router.get('/events', async (req, res) => {
    try {
        // req.user.id is available due to previous fix in auth.js
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
            // This covers cases where the ID is not found OR not owned by the NGO
            return res.status(404).json({ msg: 'Event not found or unauthorized.' });
        }

        res.json({ msg: 'Event updated successfully.', event });
    } catch (err) { 
        // FIX: Added handling for MongoDB's generic WriteConcernError, 
        // as well as explicit Mongoose validation errors.
        console.error('Event update error:', err.message);
        
        // Handle Mongoose Validation Error (e.g., failed required, bad enum value)
        if (err.name === 'ValidationError') {
             const validationErrors = Object.keys(err.errors).map(key => ({ 
                 path: key, 
                 message: err.errors[key].message 
             }));
             return res.status(400).json({ msg: 'Validation Error', errors: validationErrors });
        }
        
        // Handle duplicate key error (E11000) - usually from trying to insert a duplicate unique field
        if (err.code === 11000) {
             return res.status(400).json({ msg: 'Duplicate key error.', error: err.message });
        }
        
        res.status(500).json({ msg: 'Server Error during event update.', error: err.message });
    }
});

module.exports = router;

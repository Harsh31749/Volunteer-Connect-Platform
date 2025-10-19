const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); 

router.use(auth, (req, res, next) => {
    if (req.user.role !== 'ngo') return res.status(403).json({ msg: 'Access denied. NGO role required.' });
    next();
});

// GET /api/ngo/events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find({ ngo: req.user.id }).sort({ date: -1 });
        res.json(events);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// PUT /api/ngo/events/:eventId
router.put('/events/:eventId', async (req, res) => {
    const { title, description, location, date, capacity, category, status } = req.body;
    const updateFields = {};
    if (title) updateFields.title = title;
    // ... add all other fields ...
    
    try {
        let event = await Event.findOneAndUpdate(
            { _id: req.params.eventId, ngo: req.user.id },
            { $set: updateFields },
            { new: true } 
        );

        if (!event) return res.status(404).json({ msg: 'Event not found or unauthorized.' });

        res.json({ msg: 'Event updated successfully.', event });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

module.exports = router;
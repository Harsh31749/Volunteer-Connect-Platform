const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

// POST /api/events (NGO Only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'ngo') {
        return res.status(403).json({ msg: 'Access denied. Must be an NGO to create events.' });
    }
    try {
        const newEvent = new Event({ ngo: req.user.id, ...req.body });
        const event = await newEvent.save();
        res.status(201).json(event); // Using 201 for resource creation
    } catch (err) {
        // Improved error handling
        console.error('Event creation error:', err.message);
        res.status(500).json({ msg: 'Server Error during event creation.', error: err.message });
    }
});

// GET /api/events (Browse & Filter)
router.get('/', async (req, res) => {
    const { category, location, search } = req.query;
    let filter = { status: 'Open', date: { $gte: new Date() } }; 
    
    // Using RegExp for case-insensitive partial match
    if (category) filter.category = new RegExp(category, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (search) filter.$or = [
        { title: new RegExp(search, 'i') }, 
        { description: new RegExp(search, 'i') }
    ];

    try {
        const events = await Event.find(filter).sort({ date: 1 }).populate('ngo', 'ngoName');
        res.json(events);
    } catch (err) { 
        // Improved error handling
        console.error('Event browsing error:', err.message);
        res.status(500).json({ msg: 'Server Error during event browsing.', error: err.message });
    }
});

// GET /api/events/:eventId/registrations (NGO Management)
router.get('/:eventId/registrations', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        
        if (!event) {
            return res.status(404).json({ msg: 'Event not found.' });
        }
        
        // CRITICAL: Authorization check to ensure the user owns the event
        if (event.ngo.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. You do not own this event.' });
        }
        
        const registrations = await Registration.find({ event: req.params.eventId }).populate('volunteer', 'name email');
        res.json(registrations);
    } catch (err) { 
        // Improved error handling
        console.error(`Fetching registrations for event ${req.params.eventId} error:`, err.message);
        res.status(500).json({ msg: 'Server Error while fetching registrations.', error: err.message });
    }
});

// GET /api/events/verify-certificate/:regId (Public Verification)
router.get('/verify-certificate/:regId', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.regId)
            .populate('volunteer', 'name email')
            .populate({ path: 'event', populate: { path: 'ngo', select: 'ngoName' } });

        if (!registration) {
            return res.status(404).json({ isValid: false, msg: 'Verification ID not found.' });
        }
        if (registration.status !== 'Attended') {
            return res.status(200).json({ isValid: false, msg: `Participation status is ${registration.status}.` });
        }

        res.json({
            isValid: true, msg: 'Certificate is valid.',
            details: { 
                volunteerName: registration.volunteer.name, 
                eventTitle: registration.event.title,
                organizedBy: registration.event.ngo.ngoName // Provides NGO name for the certificate
            }
        });
    } catch (err) { 
        // Improved error handling
        console.error(`Certificate verification for ID ${req.params.regId} error:`, err.message);
        res.status(500).json({ msg: 'Server Error during certificate verification.', error: err.message });
    }
});

module.exports = router;
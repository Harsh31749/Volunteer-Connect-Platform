const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

// Middleware to restrict access to authenticated volunteers
router.use(auth, (req, res, next) => {
    if (req.user.role !== 'volunteer') {
        return res.status(403).json({ msg: 'Access denied. Volunteer role required.' });
    }
    next();
});

// GET /api/volunteers/dashboard/upcoming - Upcoming events user is registered for
router.get('/dashboard/upcoming', async (req, res) => {
    try {
        const tomorrow = new Date();
        // Sets date to tomorrow to strictly filter for future events
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const registrations = await Registration.find({ volunteer: req.user.id, status: { $in: ['Pending', 'Confirmed'] } })
        .populate({ path: 'event', select: 'title location date category capacity ngo', match: { date: { $gte: tomorrow } } });
        
        // Filter out registrations whose events were deleted or don't match the date filter
        const validRegistrations = registrations.filter(reg => reg.event !== null);

        res.json(validRegistrations);

    } catch (err) { 
        console.error('Upcoming events fetch error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching upcoming events.', error: err.message }); 
    }
});

// GET /api/volunteers/dashboard/history - Events user has attended
router.get('/dashboard/history', async (req, res) => {
    try {
        let history = await Registration.find({ volunteer: req.user.id, status: 'Attended' })
        .populate('event', 'title location date category');
        // Removed original, unreliable `.sort()` method.
        
        // Filter out registrations whose events were deleted
        history = history.filter(reg => reg.event !== null);

        // FIX: Robust in-memory sort (descending date - most recent first)
        history.sort((a, b) => {
            const dateA = a.event.date.getTime();
            const dateB = b.event.date.getTime();
            return dateB - dateA;
        });

        res.json(history);

    } catch (err) { 
        console.error('Volunteer history fetch error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching history.', error: err.message }); 
    }
});

// GET /api/volunteers/metrics - Simple volunteer metrics
router.get('/metrics', async (req, res) => {
    try {
        const eventsAttended = await Registration.countDocuments({ volunteer: req.user.id, status: 'Attended' });

        // Fetch user data to display points, which is a key metric
        const user = await User.findById(req.user.id, 'volunteerPoints badges');
        
        res.json({ 
            totalEventsAttended: eventsAttended,
            volunteerPoints: user ? user.volunteerPoints : 0,
            badges: user ? user.badges : []
        });

    } catch (err) { 
        console.error('Volunteer metrics error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching metrics.', error: err.message }); 
    }
});

// GET /api/volunteers/recommendations - Recommends events based on past attended categories
router.get('/recommendations', async (req, res) => {
    try {
        const attendedRegistrations = await Registration.find({ volunteer: req.user.id, status: 'Attended' })
            .populate('event', 'category');

        const categoryCounts = {};

        attendedRegistrations.forEach(reg => {
            if (reg.event && reg.event.category) {
                const category = reg.event.category;
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        });

        // Get the top 2 most attended categories
        const topCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 2); 

        let recommendations = [];
        if (topCategories.length > 0) {
            // Find open, future events matching the top categories
            recommendations = await Event.find({
                category: { $in: topCategories },
                date: { $gte: new Date() },
                status: 'Open',
            })
            .limit(4) // Limit results for a cleaner recommendation feed
            .populate('ngo', 'ngoName');
        }

        res.json(recommendations);

    } catch (err) { 
        console.error('Recommendation error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching recommendations.', error: err.message }); 
    }
});

module.exports = router;
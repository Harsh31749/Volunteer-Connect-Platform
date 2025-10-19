const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

router.use(auth, (req, res, next) => {
    if (req.user.role !== 'volunteer') return res.status(403).json({ msg: 'Access denied.' });
    next();
});

// GET /api/volunteers/dashboard/upcoming
router.get('/dashboard/upcoming', async (req, res) => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const registrations = await Registration.find({ volunteer: req.user.id, status: { $in: ['Pending', 'Confirmed'] } })
        .populate({ path: 'event', select: 'title location date category capacity ngo', match: { date: { $gte: tomorrow } } });
        
        const validRegistrations = registrations.filter(reg => reg.event !== null);

        res.json(validRegistrations);

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// GET /api/volunteers/dashboard/history
router.get('/dashboard/history', async (req, res) => {
    try {
        const history = await Registration.find({ volunteer: req.user.id, status: 'Attended' })
        .populate('event', 'title location date category')
        .sort({ 'event.date': -1 }); 

        res.json(history);

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// GET /api/volunteers/metrics
router.get('/metrics', async (req, res) => {
    try {
        const eventsAttended = await Registration.countDocuments({ volunteer: req.user.id, status: 'Attended' });

        res.json({ totalEventsAttended: eventsAttended });

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// GET /api/volunteers/recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const attendedRegistrations = await Registration.find({ volunteer: req.user.id, status: 'Attended' }).populate('event', 'category');
        const categoryCounts = {};

        attendedRegistrations.forEach(reg => {
            if (reg.event && reg.event.category) {
                const category = reg.event.category;
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        });

        const topCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 2); 

        let recommendations = [];
        if (topCategories.length > 0) {
            recommendations = await Event.find({
                category: { $in: topCategories },
                date: { $gte: new Date() },
                status: 'Open',
            })
            .limit(4)
            .populate('ngo', 'ngoName');
        }

        res.json(recommendations);

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

module.exports = router;
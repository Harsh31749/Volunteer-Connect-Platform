const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const PDFDocument = require('pdfkit'); 
const emailService = require('../utils/emailService');

router.use(auth, (req, res, next) => {
    if (req.user.role !== 'volunteer') {
        return res.status(403).json({ msg: 'Access denied. Volunteer role required.' });
    }
    next();
});

router.get('/dashboard/upcoming', async (req, res) => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const registrations = await Registration.find({ volunteer: req.user.id, status: { $in: ['Pending', 'Confirmed'] } })
        .populate({ path: 'event', select: 'title location date category capacity ngo', match: { date: { $gte: tomorrow } } });
        
        const validRegistrations = registrations.filter(reg => reg.event !== null);

        res.json(validRegistrations);

    } catch (err) { 
        console.error('Upcoming events fetch error:', err.message);
        res.status(500).json({ msg: 'Server Error while fetching upcoming events.', error: err.message }); 
    }
});

router.get('/dashboard/history', async (req, res) => {
    try {
        let history = await Registration.find({ volunteer: req.user.id, status: 'Attended' })
        .populate('event', 'title location date category');
        
        history = history.filter(reg => reg.event !== null);

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

router.get('/metrics', async (req, res) => {
    try {
        const eventsAttended = await Registration.countDocuments({ volunteer: req.user.id, status: 'Attended' });

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

        const topCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 2); 

        let recommendations = [];
        if (topCategories.length > 0) {
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

router.get('/certificate/:regId/download', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.regId).populate('event');

        if (!registration) {
            return res.status(404).json({msg: 'Registration not found.' });
        }
        if (registration.volunteer.toString() !== req.user.id) {
            return res.status(403).json({msg: 'Unauthorized: Registration does not belong to this volunteer.' });
        }
        if (registration.status !== 'Attended') {
            return res.status(400).json({msg: 'Certificate can only be downloaded for attended events.' });
        }
        if (!registration.event) {
            return res.status(404).json({msg: 'Event associated with registration not found.' });
        }

        const event = registration.event;
        const volunteer = await User.findById(req.user.id);
        const ngoOrganizer = await User.findById(event.ngo); // event.ngo is the ObjectId of the NGO user

        if (!volunteer || !ngoOrganizer) {
            return res.status(404).json({msg: 'Associated user record (volunteer or NGO) not found for certificate generation.' });
        }
        
        const ngoName = ngoOrganizer.ngoName || 'Unknown NGO'; // Safely access ngoName

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate_${registration._id}.pdf"`);

        const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
        doc.pipe(res); // Pipe the PDF document stream directly to the response stream

        emailService.generateCertificatePDF(doc, volunteer, event, ngoName, registration._id);


    } catch (err) {
        console.error('Certificate download streaming error:', err.message);

        if (!res.headersSent) {
            return res.status(500).json({msg: 'Server Error during certificate download: A core component failed to generate the PDF.', error: err.message });
        }
    }
});

module.exports = router;
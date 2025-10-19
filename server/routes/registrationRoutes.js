const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const emailService = require('../utils/emailService');

// POST /api/registrations/:eventId (Volunteer Signup)
router.post('/:eventId', auth, async (req, res) => {
    if (req.user.role !== 'volunteer') return res.status(403).json({ msg: 'Access denied.' });
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event || event.status !== 'Open') return res.status(404).json({ msg: 'Registration is closed.' });

        const currentRegistrations = await Registration.countDocuments({ event: req.params.eventId });
        if (currentRegistrations >= event.capacity) return res.status(400).json({ msg: 'Capacity is full.' });

        const registration = await new Registration({ volunteer: req.user.id, event: req.params.eventId }).save();
        res.json({ msg: 'Successfully registered!', registration });

    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'You are already registered.' });
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/registrations/:regId/verify (NGO Verification + Certificate Trigger)
router.put('/:regId/verify', auth, async (req, res) => {
    if (req.user.role !== 'ngo') return res.status(403).json({ msg: 'Authorization required.' });

    try {
        const registration = await Registration.findById(req.params.regId).populate('event');
        const event = registration.event;
        if (!event || event.ngo.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized.' });

        const volunteer = await User.findById(registration.volunteer);
        const ngoOrganizer = await User.findById(req.user.id);

        registration.status = 'Attended';
        await registration.save();
        
        // PDF Generation and Email
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const certificateBuffer = Buffer.concat(buffers);
            await emailService.sendCertificateEmail(volunteer, event, certificateBuffer);
        });
        emailService.generateCertificatePDF(doc, volunteer, event, ngoOrganizer.ngoName, registration._id);

        res.json({ msg: 'Attendance verified and certificate generation initiated.', registration });

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// PUT /api/registrations/:regId/cancel (Volunteer Cancel)
router.put('/:regId/cancel', auth, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.regId);
        if (!registration || registration.volunteer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized.' });

        registration.status = 'Cancelled';
        await registration.save();

        res.json({ msg: 'Registration successfully cancelled.', registration });

    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const emailService = require('../utils/emailService');

// HELPER FUNCTION: Wraps PDF generation and email sending in an awaitable Promise
const sendCertificate = (volunteer, event, ngoOrganizer, registrationId) => {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        // When PDF generation creates data chunks, push them to the buffers array
        doc.on('data', buffers.push.bind(buffers));

        // When PDF generation finishes, proceed to email and resolve/reject
        doc.on('end', async () => {
            try {
                const certificateBuffer = Buffer.concat(buffers);
                // Await the potentially error-throwing email service here
                await emailService.sendCertificateEmail(volunteer, event, certificateBuffer);
                resolve();
            } catch (err) {
                // Reject the promise if the email fails, propagating the error to the main route handler
                reject(err);
            }
        });

        // Trigger the PDF creation which emits 'data' and 'end' events
        emailService.generateCertificatePDF(doc, volunteer, event, ngoOrganizer.ngoName, registrationId);
        
        // CRITICAL FIX: Must explicitly end the document stream to trigger the 'end' event.
        doc.end(); 
    });
};

// POST /api/registrations/:eventId (Volunteer Signup)
router.post('/:eventId', auth, async (req, res) => {
    if (req.user.role !== 'volunteer') return res.status(403).json({ msg: 'Access denied.' });
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event || event.status !== 'Open') return res.status(404).json({ msg: 'Registration is closed or event not found.' });

        const currentRegistrations = await Registration.countDocuments({ event: req.params.eventId });
        if (currentRegistrations >= event.capacity) return res.status(400).json({ msg: 'Capacity is full.' });

        const registration = await new Registration({ volunteer: req.user.id, event: req.params.eventId }).save();
        res.json({ msg: 'Successfully registered!', registration });

    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'You are already registered.' });
        console.error('Registration error:', err.message);
        res.status(500).json({ msg: 'Server Error during registration.', error: err.message });
    }
});

// PUT /api/registrations/:regId/verify (NGO Verification + Certificate Trigger)
router.put('/:regId/verify', auth, async (req, res) => {
    if (req.user.role !== 'ngo') return res.status(403).json({ msg: 'Authorization required.' });

    try {
        const registration = await Registration.findById(req.params.regId).populate('event');

        // Robustness checks for missing registration or event
        if (!registration || !registration.event) return res.status(404).json({ msg: 'Registration or event not found.' });
        const event = registration.event;

        // Authorization check: Ensure the event belongs to this NGO
        if (event.ngo.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized: NGO does not own this event.' });

        const volunteer = await User.findById(registration.volunteer);
        const ngoOrganizer = await User.findById(req.user.id);
        
        // Robustness Check: Ensure both users exist
        if (!volunteer || !ngoOrganizer) return res.status(404).json({ msg: 'Associated user record (volunteer or NGO) not found.' });

        // Logic Refinement: Only award points and send certificate if status changes
        if (registration.status !== 'Attended') {
            const pointsToAdd = 5; 
            volunteer.volunteerPoints = (volunteer.volunteerPoints || 0) + pointsToAdd;
            await volunteer.save();
            
            registration.status = 'Attended';
            await registration.save();
            
            await sendCertificate(volunteer, event, ngoOrganizer, registration._id);

            res.json({ 
                msg: 'Attendance verified, volunteer points updated, and certificate sent.', 
                registration,
                updatedPoints: volunteer.volunteerPoints
            });
        } else {
             res.json({ 
                msg: 'Attendance already verified.', 
                registration,
                updatedPoints: volunteer.volunteerPoints
            });
        }


    } catch (err) { 
        console.error('Certificate verification error:', err.message);
        res.status(500).json({ msg: 'Server Error during verification/certificate sending.', error: err.message }); 
    }
});

router.put('/:regId/cancel', auth, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.regId);
        
        if (!registration) return res.status(404).json({ msg: 'Registration not found.' });
        
        if (registration.volunteer.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized.' });

        if (registration.status === 'Attended') return res.status(400).json({ msg: 'Cannot cancel: attendance has already been verified.' });

        registration.status = 'Cancelled';
        await registration.save();

        res.json({ msg: 'Registration successfully cancelled.', registration });

    } catch (err) { 
        console.error('Cancellation error:', err.message);
        res.status(500).json({ msg: 'Server Error during cancellation.', error: err.message });
    }
});

module.exports = router;
const nodemailer = require('nodemailer');
const fs = require('fs'); // Often needed for reading email templates or private keys
// Assuming you use a service like Gmail/SendGrid/SES via environment variables
const path = require('path');

// --- 1. Nodemailer Transporter Setup ---
// The most robust way to handle this is to use a configured transporter.
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'SendGrid', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 2. PDF Generation Function (The missing piece in your logic) ---
// This function needs to actually write the visual content to the PDFDocument stream.
const generateCertificatePDF = (doc, volunteer, event, ngoName, registrationId) => {
    // Set up basic PDF properties (optional, but good practice)
    doc.info.Title = 'Volunteer Certificate of Attendance';
    doc.info.Author = ngoName;

    // --- Design the Certificate ---
    
    // Set font and size
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#004D40').text('Certificate of Appreciation', { align: 'center' });

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(20).text('Proudly Presented to', { align: 'center' });

    doc.moveDown(1);
    // Volunteer Name
    doc.font('Times-Roman').fontSize(48).fillColor('#D81B60').text(volunteer.name, { align: 'center' });

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(16).fillColor('#000000').text(`For their dedication and successful participation in:`, { align: 'center' });

    doc.moveDown(0.5);
    // Event Title
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#004D40').text(event.title, { align: 'center' });

    doc.moveDown(0.5);
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Helvetica').fontSize(14).text(`Held on: ${eventDate} in ${event.location}`, { align: 'center' });

    doc.moveDown(2);
    // NGO Name / Organizer
    doc.font('Helvetica-Bold').fontSize(18).text(`Organized by: ${ngoName}`, { align: 'center' });

    doc.moveDown(0.5);
    // Unique ID for verification
    doc.font('Helvetica').fontSize(10).text(`Verification ID: ${registrationId}`, { align: 'center' });

    // The logic in registrationRoutes.js calls doc.end() 
    // This is important: PDFKit is stream-based, and the content above 
    // is written when the caller ends the stream (`doc.end()`).
};

// --- 3. Email Sending Function ---
const sendCertificateEmail = async (volunteer, event, certificateBuffer) => {
    // Option 1: Use a dedicated template system (e.g., Handlebars, EJS)
    // Option 2: Use basic HTML for simplicity
    const mailOptions = {
        from: `"${process.env.APP_NAME || 'Volunteer Platform'}" <${process.env.EMAIL_USER}>`,
        to: volunteer.email,
        subject: `Your Certificate for Event: ${event.title}`,
        html: `
            <p>Dear ${volunteer.name},</p>
            <p>Congratulations! Your attendance for the event <strong>${event.title}</strong> has been verified.</p>
            <p>Your certificate is attached to this email. Thank you for your valuable contribution!</p>
            <p>You earned 5 volunteer points for this event!</p>
            <p>Best regards,</p>
            <p>The ${event.ngoName || ngoOrganizer.name} Team</p>
        `,
        attachments: [
            {
                filename: `Certificate_${event.title.replace(/\s/g, '_')}.pdf`,
                content: certificateBuffer, // Buffer is provided by the helper function in registrationRoutes.js
                contentType: 'application/pdf'
            }
        ]
    };

    // The nodemailer.sendMail returns a promise, so awaiting it handles success/failure
    const info = await transporter.sendMail(mailOptions);
    console.log('Certificate email sent:', info.messageId);
    
    // NOTE: This function only handles the email part. The PDF generation 
    // stream handling (buffer collection and rejection) is handled by the wrapper 
    // function in `registrationRoutes.js`.
};

module.exports = {
    sendCertificateEmail,
    generateCertificatePDF
};
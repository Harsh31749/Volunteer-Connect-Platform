const nodemailer = require('nodemailer');
const fs = require('fs'); 
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateCertificatePDF = (doc, volunteer, event, ngoName, registrationId) => {
    doc.info.Title = 'Volunteer Certificate of Attendance';
    doc.info.Author = ngoName;

    
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#004D40').text('Certificate of Appreciation', { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(16).text('Proudly Presented to', { align: 'center' });

    doc.moveDown(0.2);
    doc.font('Times-Roman').fontSize(40).fillColor('#D81B60').text(volunteer.name, { align: 'center' });

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(13).fillColor('#000000').text(`For their dedication and successful participation in:`, { align: 'center' });

    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#004D40').text(event.title, { align: 'center' });

    doc.moveDown(0.2);
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Helvetica').fontSize(11).text(`Held on: ${eventDate} in ${event.location}`, { align: 'center' });

    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(13).text(`Organized by: ${ngoName}`, { align: 'center' });

    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(8).text(`Verification ID: ${registrationId}`, { align: 'center' });
};

const sendCertificateEmail = async (volunteer, event, certificateBuffer, ngoName) => {
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
            <p>The ${ngoName || 'Organizer'} Team</p> `,
        attachments: [
            {
                filename: `Certificate_${event.title.replace(/\s/g, '_')}.pdf`,
                content: certificateBuffer, 
                contentType: 'application/pdf'
            }
        ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Certificate email sent:', info.messageId);
};

module.exports = {
    sendCertificateEmail,
    generateCertificatePDF
};
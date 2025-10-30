const nodemailer = require('nodemailer');
const fs = require('fs'); 
const path = require('path');
// Import PDFDocument here if it's not globally available, as it's needed for the doc object
const PDFDocument = require('pdfkit'); 
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Generates the single-page, centered PDF certificate.
 */
const generateCertificatePDF = (doc, volunteer, event, ngoName, registrationId) => {
    doc.info.Title = 'Volunteer Certificate of Attendance';
    doc.info.Author = ngoName;

    // --- COLOR CONSTANTS ---
    const PRIMARY_COLOR = '#007bff';
    const SECONDARY_COLOR = '#FF6B00';
    const DARK_TEXT = '#1a1a1a';
    const LIGHT_TEXT = '#555';
    const LIGHT_BG = '#f4f7f9';

    const page = doc.page;
    const margins = page.margins;
    
    // Line 34 in my previous corrected version:
    // This line is now safely declared with 'const'
    const USABLE_WIDTH = page.width - margins.left - margins.right; 
    const MARGIN_LEFT = margins.left;
    
    let currentY = 120; // Initial Y position for the header

    // 1. Draw Background and Border
    doc.rect(0, 0, page.width, page.height).fill(LIGHT_BG); 
    
    // Stylish border
    doc.rect(margins.left / 2, margins.top / 2, page.width - margins.left, page.height - margins.top)
       .lineWidth(10)
       .stroke(SECONDARY_COLOR);

    // Inner background
    doc.rect(margins.left, margins.top, USABLE_WIDTH, page.height - margins.top - margins.bottom)
       .fillAndStroke('#ffffff', '#ffffff');

    // 2. Certificate Title
    doc.font('Helvetica-Bold')
       .fontSize(36)
       .fillColor(PRIMARY_COLOR)
       .text('Certificate of Appreciation', MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: USABLE_WIDTH
       });

    currentY = doc.y + 20;
    
    // 3. Introductory Text
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor(DARK_TEXT)
       .text('Proudly Presented to', MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: USABLE_WIDTH 
       });

    // 4. Volunteer Name (Most Prominent)
    currentY = doc.y + 10;
    doc.font('Times-Roman') 
       .fontSize(52) 
       .fillColor(SECONDARY_COLOR) 
       .text(volunteer.name, MARGIN_LEFT, currentY, { 
           align: 'center',
           underline: true,
           width: USABLE_WIDTH 
       });
    
    // 5. Contribution Description
    currentY = doc.y + 20;
    doc.font('Helvetica')
       .fontSize(16)
       .fillColor(LIGHT_TEXT)
       .text(`For their valuable contribution and successful participation in:`, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: USABLE_WIDTH 
       });

    // 6. Event Title (Bold and Clear)
    currentY = doc.y + 10;
    doc.font('Helvetica-Bold')
       .fontSize(28)
       .fillColor(PRIMARY_COLOR) 
       .text(event.title, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: USABLE_WIDTH 
       });

    // 7. Event Metadata
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    currentY = doc.y + 10;
    doc.font('Helvetica')
       .fontSize(14)
       .fillColor(LIGHT_TEXT)
       .text(`Held on: ${eventDate} in ${event.location}`, MARGIN_LEFT, currentY, { align: 'center', width: USABLE_WIDTH });

    // 8. Organizer Info
    currentY = doc.y + 30;
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor(DARK_TEXT)
       .text(`Organized by: ${ngoName}`, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: USABLE_WIDTH
       });

    // 10. Verification ID (CRITICAL FIX: Placed explicitly at the very bottom of Page 1)
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(DARK_TEXT)
       .text(`Verification ID: ${registrationId}`, MARGIN_LEFT, currentY = doc.y + 50 , { 
           align: 'center',
           width: USABLE_WIDTH
       });
    
    doc.end();
};

const sendCertificateEmail = async (volunteer, event, certificateBuffer, ngoName) => {
    // ... (This function remains unchanged)
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
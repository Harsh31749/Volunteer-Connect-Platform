const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const stream = require('stream');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateCertificatePDF = (volunteer, event, ngoName, registrationId) => {
    const volunteerName = volunteer.name;
    const eventTitle = event.title;
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const eventLocation = event.location;
    const ngoTitle = (typeof ngoName === 'object' && ngoName.title) ? ngoName.title : ngoName;

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const pdfStream = new stream.PassThrough(); 

    doc.pipe(pdfStream);

    doc.info.Title = 'Volunteer Certificate of Attendance';
    doc.info.Author = ngoTitle;

    // --- COLOR CONSTANTS ---
    const PRIMARY_COLOR = '#007bff';
    const SECONDARY_COLOR = '#FF6B00';
    const DARK_TEXT = '#1a1a1a';
    const LIGHT_TEXT = '#555';
    const LIGHT_BG = '#f4f7f9';

    const margins = doc.page.margins;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const usableWidth = pageWidth - margins.left - margins.right;
    const MARGIN_LEFT = margins.left;

    // Adjusted Y position for Landscape (starting slightly higher usually works better)
    let currentY = 100; 

    // 1. Draw Background and Border
    doc.rect(0, 0, pageWidth, pageHeight).fill(LIGHT_BG);
    doc.rect(margins.left / 2, margins.top / 2, pageWidth - margins.left, pageHeight - margins.top)
       .lineWidth(10)
       .stroke(SECONDARY_COLOR);
    doc.rect(margins.left, margins.top, usableWidth, pageHeight - margins.top - margins.bottom)
       .fillAndStroke('#ffffff', '#ffffff');

    // 2. Certificate Title
    doc.font('Helvetica-Bold')
       .fontSize(36)
       .fillColor(PRIMARY_COLOR)
       .text('Certificate of Appreciation', MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth
       });

    currentY = doc.y + 20;

    // 3. Introductory Text
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor(DARK_TEXT)
       .text('Proudly Presented to', MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth 
       });

    // 4. Volunteer Name
    currentY = doc.y + 10;
    doc.font('Times-Roman') 
       .fontSize(52) 
       .fillColor(SECONDARY_COLOR) 
       .text(volunteerName, MARGIN_LEFT, currentY, { 
           align: 'center',
           underline: true,
           width: usableWidth 
       });

    // 5. Contribution Description
    currentY = doc.y + 20;
    doc.font('Helvetica')
       .fontSize(16)
       .fillColor(LIGHT_TEXT)
       .text(`For their valuable contribution and successful participation in:`, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth 
       });

    // 6. Event Title
    currentY = doc.y + 10;
    doc.font('Helvetica-Bold')
       .fontSize(28)
       .fillColor(PRIMARY_COLOR) 
       .text(eventTitle, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth 
       });

    currentY = doc.y + 10;
    doc.font('Helvetica')
       .fontSize(14)
       .fillColor(LIGHT_TEXT)
       .text(`Held on: ${eventDate} at ${eventLocation}`, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth
       });

    currentY = doc.y + 30;
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor(DARK_TEXT)
       .text(`Organized by: ${ngoTitle}`, MARGIN_LEFT, currentY, { 
           align: 'center', 
           width: usableWidth
       });

    currentY = doc.y + 40; // Adjusted spacing for footer
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(DARK_TEXT)
       .text(`Verification ID: ${registrationId}`, MARGIN_LEFT, currentY, { 
           align: 'center',
           width: usableWidth
       });

    doc.end(); 
    return pdfStream; 
};

const sendCertificateEmail = async (volunteer, event, certificateData, ngoName) => {
    try {
        let certificateBuffer;

        if (Buffer.isBuffer(certificateData)) {
            certificateBuffer = certificateData;
        } else {
            certificateBuffer = await new Promise((resolve, reject) => {
                const buffers = [];
                certificateData.on('data', (chunk) => buffers.push(chunk));
                certificateData.on('end', () => resolve(Buffer.concat(buffers)));
                certificateData.on('error', (err) => reject(new Error('Stream error: ' + err.message)));
            });
        }

        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Volunteer Platform'}" <${process.env.EMAIL_USER}>`,
            to: volunteer.email,
            subject: `Your Certificate for Event: ${event.title}`,
            html: `
                <p>Dear ${volunteer.name},</p>
                <p>Congratulations! Your attendance for the event <strong>${event.title}</strong> has been verified.</p>
                <p>Your certificate is attached to this email.</p>
                <p>Best regards,</p>
                <p>The ${ngoName || 'Organizer'} Team</p>`,
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
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    generateCertificatePDF,
    sendCertificateEmail
};
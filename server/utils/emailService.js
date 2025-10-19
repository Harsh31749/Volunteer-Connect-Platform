const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'YOUR_EMAIL@gmail.com', pass: 'YOUR_APP_PASSWORD' }
});

exports.sendCertificateEmail = async (volunteer, event, certificateBuffer) => {
    const mailOptions = {
        from: 'Volunteer Connect Platform <YOUR_EMAIL@gmail.com>',
        to: volunteer.email,
        subject: `Certificate of Attendance: ${event.title}`,
        html: `<p>Dear ${volunteer.name}, find your attached digital certificate.</p>`,
        attachments: [{
            filename: `Certificate_${volunteer.name.replace(/\s/g, '_')}.pdf`,
            content: certificateBuffer,
            contentType: 'application/pdf'
        }]
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${volunteer.email}:`, error);
    }
};

exports.generateCertificatePDF = (doc, volunteer, event, ngoName, regId) => {
    doc.fontSize(25).text('CERTIFICATE OF PARTICIPATION', { align: 'center' });
    doc.moveDown(5);
    doc.fontSize(20).text(`${volunteer.name} successfully completed the event: ${event.title}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).text(`Date: ${new Date(event.date).toDateString()}`, { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(12).text(`Organized by: ${ngoName}`, { align: 'left' });
    doc.text('Verification ID: ' + regId.toString(), { align: 'right' });
    doc.end();
};
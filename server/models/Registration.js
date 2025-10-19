const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Attended', 'Cancelled'], default: 'Pending' },
    registeredAt: { type: Date, default: Date.now }
});

RegistrationSchema.index({ volunteer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
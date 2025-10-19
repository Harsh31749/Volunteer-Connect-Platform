const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    category: { type: String, enum: ['Education', 'Environment', 'Health', 'Community', 'Other'], default: 'Community' },
    status: { type: String, enum: ['Open', 'Full', 'Completed', 'Cancelled'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
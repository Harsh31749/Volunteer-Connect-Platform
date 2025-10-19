const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['volunteer', 'ngo', 'admin'], default: 'volunteer' },
    ngoName: { type: String, required: function() { return this.role === 'ngo'; } },
    volunteerPoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    date: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    // Check if password was modified AND if it exists (skip for Google Auth users)
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    
    // Hash the password
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // Do NOT call next() here, as the promise implicitly handles it on resolve
    } catch (err) {
        return next(err); // Pass error to Mongoose to abort save
    }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
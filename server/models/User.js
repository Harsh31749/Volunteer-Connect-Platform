const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Assuming bcrypt is installed and used

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Password is now conditionally required via hook
    role: { type: String, enum: ['volunteer', 'ngo', 'admin'], default: 'volunteer' },
    ngoName: { type: String, required: function() { return this.role === 'ngo'; } },
    volunteerPoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    date: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        if ((this.role === 'ngo' || this.role === 'admin') && !this.password) {
        }
        return next();
    }
    
    if (this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
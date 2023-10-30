const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: {
        type: String,
        enum: ['Cliente', 'Administrador'],
        required: true
    },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);

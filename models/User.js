const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    qualification: String,
    experience: String,
    gender: String,
    photo: String,
    age: Number,
    address: String,

    user_role: {
        type: Number,
        default: 2,
    },

    account_status: {
        type: Boolean,
        default: true
    },

    otp: String,
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
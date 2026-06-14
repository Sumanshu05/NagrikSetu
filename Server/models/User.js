const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    password:{
        type: String,
        required: true,
        trim: true,
    },
    token: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['citizen', 'officer', 'admin'],
        default: 'citizen'
    },
    ward: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward'
    },
    image: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    complaintsFiled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
    }],
    upvotedComplaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
    }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
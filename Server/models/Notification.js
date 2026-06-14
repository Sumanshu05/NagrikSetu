const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["upvote", "status_update", "complaint_rejected", "complaint_resolved", "general"],
            default: "general",
        },
        message: {
            type: String,
            required: true,
        },
        refModel: {
            type: String,
            enum: ["Complaint"],
        },
        ref: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "refModel",
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

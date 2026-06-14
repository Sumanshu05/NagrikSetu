const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        note: {
            type: String,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
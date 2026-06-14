const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["roads", "water", "electricity", "sanitation", "other"],
            required: true,
        },

        photos: [
            {
                url: String,
                publicId: String,
            },
        ],

        officerupload: {
            url: String,
            publicId: String,
        },

        location: {
            type: {
                type: String,
                default: "Point",
            },
            coordinates: [Number],
            landmark: String,
            ward: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ward",
            },
        },

        status: {
            type: String,
            enum: [
                "pending",
                "assigned",
                "in_progress",
                "resolved",
                "rejected",
                "escalated",
            ],
            default: "pending",
        },

        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // The citizen who filed the complaint
        filedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        priorityScore: {
            type: Number,
            default: 0,
        },

        upVotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        upVoteCount: {
            type: Number,
            default: 0,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        escalatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        hourDeadline: Date,
        resolvedAt: Date,
        resolutionNote: String,
        closingPhoto: {
            url: String,
            publicId: String,
        },

        citizenRating: {
            type: Number,
            min: 1,
            max: 5,
        },

        isDuplicate: {
            type: Boolean,
            default: false,
        },

        duplicateOf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
        },

        activityLog: [
            {
                action: String,
                performedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                note: String,
                meta: mongoose.Schema.Types.Mixed,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        statusHistory: [
            {
                status: String,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                note: String,
                at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Complaint", complaintSchema);
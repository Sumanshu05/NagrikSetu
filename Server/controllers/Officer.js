const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Ward = require("../models/Ward");
const { sendNotification } = require("../services/notificationService");

// Resolution time limits per category (hours)
const GIVEN_HOURS = {
    roads: 72,
    water: 24,
    electricity: 12,
    sanitation: 48,
    other: 48,
};

// ─── Assign Complaint ─────────────────────────────────────────────────────────
exports.assignComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const officerId = req.user.id;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        const hoursAllowed = GIVEN_HOURS[complaint.category] ?? GIVEN_HOURS.other;
        const hourDeadline = new Date(Date.now() + hoursAllowed * 3_600_000);

        complaint.assignedTo = officerId;
        complaint.hourDeadline = hourDeadline;
        complaint.status = "assigned";
        complaint.activityLog.push({
            action: "assigned",
            performedBy: officerId,
            note: `Assigned to officer. Deadline: ${hoursAllowed}h`,
            timestamp: new Date(),
        });
        complaint.statusHistory.push({
            status: "assigned",
            changedBy: officerId,
            note: `Assigned to officer.`,
            at: new Date(),
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint assigned successfully",
            complaint,
        });
    } catch (error) {
        console.error("assignComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: "Error assigning complaint",
        });
    }
};

// ─── Get Ward Complaints (grouped by status) ──────────────────────────────────
exports.getWardComplaints = async (req, res) => {
    try {
        // Officer's ward is set by isOfficer middleware or decoded from JWT
        const wardId = req.user.ward;

        if (!wardId) {
            return res.status(400).json({
                success: false,
                message: "No ward associated with this officer",
            });
        }

        const grouped = await Complaint.aggregate([
            { $match: { "location.ward": wardId } },
            {
                $group: {
                    _id: "$status",
                    complaints: { $push: "$$ROOT" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: { status: "$_id", complaints: 1, count: 1, _id: 0 },
            },
        ]);

        const result = {};
        for (const group of grouped) {
            result[group.status] = group;
        }

        return res.status(200).json({
            success: true,
            ward: wardId,
            data: result,
            message: "Ward complaints fetched successfully",
        });
    } catch (error) {
        console.error("getWardComplaints error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching ward complaints",
        });
    }
};

// ─── Get Officer Stats ────────────────────────────────────────────────────────
exports.getOfficerStats = async (req, res) => {
    try {
        const officerId = req.user.id;
        const now = new Date();

        const [stats] = await Complaint.aggregate([
            { $match: { assignedTo: officerId } },
            {
                $group: {
                    _id: null,
                    resolvedCount: {
                        $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
                    },
                    avgResolutionDays: {
                        $avg: {
                            $cond: [
                                { $eq: ["$status", "resolved"] },
                                {
                                    $divide: [
                                        { $subtract: ["$resolvedAt", "$createdAt"] },
                                        86_400_000,
                                    ],
                                },
                                null,
                            ],
                        },
                    },
                    overdueCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$status", "resolved"] },
                                        { $lt: ["$hourDeadline", now] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    ratingAvg: { $avg: "$citizenRating" },
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: stats ?? {
                resolvedCount: 0,
                avgResolutionDays: 0,
                overdueCount: 0,
                ratingAvg: null,
            },
        });
    } catch (error) {
        console.error("getOfficerStats error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching officer stats",
        });
    }
};

// ─── Reject Complaint ─────────────────────────────────────────────────────────
exports.rejectComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { reason } = req.body;
        const officerId = req.user.id;

        if (!reason?.trim()) {
            return res.status(400).json({
                success: false,
                message: "A rejection reason is required",
            });
        }

        const complaint = await Complaint.findById(complaintId).populate("filedBy");
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        complaint.status = "rejected";
        complaint.activityLog.push({
            action: "rejected",
            performedBy: officerId,
            note: reason.trim(),
            timestamp: new Date(),
        });
        complaint.statusHistory.push({
            status: "rejected",
            changedBy: officerId,
            note: reason.trim(),
            at: new Date(),
        });

        await complaint.save();

        // Notify citizen
        sendNotification({
            to: complaint.filedBy,
            type: "complaint_rejected",
            title: "Your complaint was rejected",
            body: `Reason: ${reason.trim()}`,
            data: { complaintId: complaint._id.toString() },
        }).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Complaint rejected",
            complaintId,
        });
    } catch (error) {
        console.error("rejectComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── Get Officer Leaderboard ──────────────────────────────────────────────────
exports.getOfficerLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.aggregate([
            { $match: { role: "officer" } },
            {
                $lookup: {
                    from: "complaints",
                    localField: "_id",
                    foreignField: "assignedTo",
                    as: "assignedComplaints",
                },
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    resolvedCount: {
                        $size: {
                            $filter: {
                                input: "$assignedComplaints",
                                as: "complaint",
                                cond: { $eq: ["$$complaint.status", "resolved"] },
                            },
                        },
                    },
                },
            },
            { $sort: { resolvedCount: -1 } },
            { $limit: 10 },
        ]);

        return res.status(200).json({
            success: true,
            data: leaderboard,
            message: "Leaderboard fetched successfully",
        });
    } catch (error) {
        console.error("getOfficerLeaderboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching officer leaderboard",
        });
    }
};

// ─── Transfer Complaint ────────────────────────────────────────────────────────
exports.transferComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { toOfficerId, toWard, note } = req.body;
        const fromOfficerId = req.user.id;

        if (!toOfficerId) {
            return res.status(400).json({
                success: false,
                message: "toOfficerId is required",
            });
        }

        const [complaint, targetOfficer] = await Promise.all([
            Complaint.findById(complaintId),
            User.findById(toOfficerId),
        ]);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        if (!targetOfficer) {
            return res.status(404).json({
                success: false,
                message: "Target officer not found",
            });
        }

        complaint.assignedTo = toOfficerId;
        if (toWard) complaint.location.ward = toWard;

        const hoursAllowed =
            GIVEN_HOURS[complaint.category] ?? GIVEN_HOURS.other;
        complaint.hourDeadline = new Date(Date.now() + hoursAllowed * 3_600_000);
        complaint.status = "assigned";

        complaint.activityLog.push({
            action: "transferred",
            performedBy: fromOfficerId,
            note: note?.trim() || `Transferred to officer ${toOfficerId}`,
            meta: { fromOfficerId, toOfficerId, toWard },
            timestamp: new Date(),
        });

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Complaint transferred successfully",
            complaint,
        });
    } catch (error) {
        console.error("transferComplaint error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
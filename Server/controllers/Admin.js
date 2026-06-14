const User = require("../models/User");
const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");

// ─── Get All Users (with filtering) ───────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isVerified } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === "true";

        const users = await User.find(filter)
            .select("-password")
            .populate("ward", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error("getAllUsers error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
        });
    }
};

// ─── Verify Officer ───────────────────────────────────────────────────────────
exports.verifyOfficer = async (req, res) => {
    try {
        const { officerId } = req.params;

        if (!mongoose.isValidObjectId(officerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Officer ID",
            });
        }

        const officer = await User.findById(officerId);
        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Officer not found",
            });
        }

        if (officer.role !== "officer") {
            return res.status(400).json({
                success: false,
                message: "User is not an officer",
            });
        }

        officer.isVerified = true;
        await officer.save();

        return res.status(200).json({
            success: true,
            message: "Officer verified successfully",
            data: {
                id: officer._id,
                name: officer.name,
                isVerified: officer.isVerified
            }
        });
    } catch (error) {
        console.error("verifyOfficer error:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying officer",
        });
    }
};

// ─── Get Admin Dashboard Stats ────────────────────────────────────────────────
exports.getAdminStats = async (req, res) => {
    try {
        const [userStats, complaintStats, pendingOfficers, categoryStats] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                        verifiedCount: {
                            $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] }
                        }
                    }
                }
            ]),
            Complaint.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),
            User.countDocuments({ role: "officer", isVerified: false }),
            Complaint.aggregate([
                {
                    $group: {
                        _id: { category: "$category", status: "$status" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.category",
                        total: { $sum: "$count" },
                        resolved: {
                            $sum: {
                                $cond: [{ $eq: ["$_id.status", "resolved"] }, "$count", 0]
                            }
                        }
                    }
                }
            ])
        ]);

        // Process stats into a clean format
        const stats = {
            citizens: 0,
            officers: 0,
            verifiedOfficers: 0,
            totalComplaints: 0,
            resolvedComplaints: 0,
            pendingVerifications: pendingOfficers,
            categories: categoryStats.map(c => ({
                name: c._id,
                total: c.total,
                resolved: c.resolved,
                rate: c.total ? Math.round((c.resolved / c.total) * 100) : 0
            }))
        };

        userStats.forEach(u => {
            if (u._id === 'citizen') stats.citizens = u.count;
            if (u._id === 'officer') {
                stats.officers = u.count;
                stats.verifiedOfficers = u.verifiedCount;
            }
        });

        complaintStats.forEach(c => {
            stats.totalComplaints += c.count;
            if (c._id === 'resolved') stats.resolvedComplaints = c.count;
        });

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("getAdminStats error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching admin stats",
        });
    }
};

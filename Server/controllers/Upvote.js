const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Upvote weight per category
const CATEGORY_WEIGHTS = {
    roads: 3,
    electricity: 3,
    water: 4,
    sanitation: 2,
    other: 1,
};

// Recompute priority score based on upvotes, age, and category
function computePriorityScore(complaint) {
    const upvoteWeight = (complaint.upVoteCount || 0) * 2;
    const ageInDays =
        (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const ageWeight = Math.min(ageInDays * 0.5, 20);
    const categoryWeight = CATEGORY_WEIGHTS[complaint.category] ?? 1;
    return upvoteWeight + ageWeight + categoryWeight;
}

// Internal: send upvote notification
async function sendUpvoteNotification({ ownerId, voterId, complaint }) {
    try {
        const voter = await User.findById(voterId).select("name");

        await Notification.create({
            user: ownerId,
            type: "upvote",
            message: `${voter?.name ?? "Someone"} upvoted your complaint: "${complaint.title}"`,
            refModel: "Complaint",
            ref: complaint._id,
            read: false,
        });

        const io = global._io;
        if (io) {
            io.to(ownerId.toString()).emit("notification:upvote", {
                complaintId: complaint._id,
                message: `${voter?.name ?? "Someone"} upvoted your complaint`,
            });
        }
    } catch (error) {
        console.error("Upvote notification error:", error);
    }
}

// ─── Toggle Upvote ────────────────────────────────────────────────────────────
exports.toggleUpvote = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const userId = req.user.id;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        const alreadyUpvoted = complaint.upVotes.some(
            (id) => id.toString() === userId.toString()
        );

        if (alreadyUpvoted) {
            // Remove upvote
            complaint.upVotes.pull(userId);
            complaint.upVoteCount = Math.max(0, complaint.upVoteCount - 1);
        } else {
            // Add upvote
            complaint.upVotes.push(userId);
            complaint.upVoteCount += 1;

            // Notify the complaint owner (skip self-upvote)
            if (complaint.filedBy.toString() !== userId.toString()) {
                await sendUpvoteNotification({
                    ownerId: complaint.filedBy,
                    voterId: userId,
                    complaint,
                });
            }
        }

        // Recompute priority score
        complaint.priorityScore = computePriorityScore(complaint);
        await complaint.save();

        return res.status(200).json({
            success: true,
            upvoted: !alreadyUpvoted,
            upVoteCount: complaint.upVoteCount,
            priorityScore: complaint.priorityScore,
            message: alreadyUpvoted ? "Upvote removed" : "Upvoted successfully",
        });
    } catch (error) {
        console.error("toggleUpvote error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ─── Get Upvoters (officer/admin only) ───────────────────────────────────────
exports.getUpvoters = async (req, res) => {
    try {
        const { complaintId } = req.params;

        if (!["officer", "admin"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const complaint = await Complaint.findById(complaintId).populate(
            "upVotes",
            "name email phoneNumber role createdAt"
        );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        return res.status(200).json({
            success: true,
            complaintId,
            upVoteCount: complaint.upVoteCount,
            upvoters: complaint.upVotes,
        });
    } catch (error) {
        console.error("getUpvoters error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

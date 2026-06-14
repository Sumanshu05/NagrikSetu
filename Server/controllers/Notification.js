const Notification = require("../models/Notification");

// ─── Get My Notifications (paginated) ─────────────────────────────────────────
exports.getMyNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "ref",
                    select: "title status category priorityScore",
                }),
            Notification.countDocuments({ user: userId }),
            Notification.countDocuments({ user: userId, read: false }),
        ]);

        return res.status(200).json({
            success: true,
            unreadCount,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
            },
            notifications,
        });
    } catch (error) {
        console.error("getMyNotification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Get Unread Count ─────────────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            read: false,
        });

        return res.status(200).json({
            success: true,
            message: "Unread notification count",
            unreadCount,
        });
    } catch (error) {
        console.error("getUnreadCount error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Mark One as Read ─────────────────────────────────────────────────────────
exports.markOneRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.notificationId,
                user: req.user.id,
            },
            { read: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("markOneRead error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
exports.markAllRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { user: req.user.id, read: false },
            { read: true, readAt: new Date() }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updated: result.modifiedCount,
        });
    } catch (error) {
        console.error("markAllRead error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Delete One Notification ──────────────────────────────────────────────────
exports.deleteOne = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.notificationId,
            user: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        console.error("deleteOne error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ─── Delete All Notifications ─────────────────────────────────────────────────
exports.deleteAll = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ user: req.user.id });

        return res.status(200).json({
            success: true,
            message: "All notifications cleared",
            deleted: result.deletedCount,
        });
    } catch (error) {
        console.error("deleteAll error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
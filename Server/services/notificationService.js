const Notification = require("../models/Notification");

/**
 * Creates a notification document in the database and optionally
 * emits a real-time event via Socket.io (if global._io is available).
 *
 * @param {Object} options
 * @param {Object} options.to        - Populated user object (must have _id)
 * @param {string} options.title     - Short notification title
 * @param {string} options.body      - Longer notification body text
 * @param {Object} [options.data]    - Extra data (e.g. { complaintId })
 * @param {string} [options.type]    - Notification type (default: "general")
 */
exports.sendNotification = async ({ to, title, body, data = {}, type = "general" }) => {
    try {
        if (!to || !to._id) {
            console.warn("⚠️ sendNotification: no valid recipient provided");
            return;
        }

        const notification = await Notification.create({
            user: to._id,
            type,
            message: body,
            refModel: data.complaintId ? "Complaint" : undefined,
            ref: data.complaintId || undefined,
            read: false,
        });

        // Real-time push via Socket.io if available
        const io = global._io;
        if (io) {
            io.to(to._id.toString()).emit("notification", {
                title,
                body,
                data,
                notificationId: notification._id,
            });
        }

        return notification;
    } catch (error) {
        console.error("❌ sendNotification error:", error.message);
    }
};

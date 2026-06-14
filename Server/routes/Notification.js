const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const {
    getMyNotification,
    getUnreadCount,
    markOneRead,
    markAllRead,
    deleteOne,
    deleteAll,
} = require("../controllers/Notification");

// ── Notification Routes ───────────────────────────────────────────────────────
router.get("/", auth, getMyNotification);
router.get("/unread-count", auth, getUnreadCount);
router.patch("/:notificationId/read", auth, markOneRead);
router.patch("/read-all", auth, markAllRead);
router.delete("/:notificationId", auth, deleteOne);
router.delete("/", auth, deleteAll);

module.exports = router;

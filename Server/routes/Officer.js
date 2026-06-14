const express = require("express");
const router = express.Router();

const { auth, isOfficer } = require("../middlewares/auth");

const {
    assignComplaint,
    getWardComplaints,
    getOfficerStats,
    rejectComplaint,
    transferComplaint,
    getOfficerLeaderboard,
} = require("../controllers/Officer");

// ── Officer Routes (all protected, officer role required) ────────────────────
router.get("/ward-complaints", auth, isOfficer, getWardComplaints);
router.get("/stats", auth, isOfficer, getOfficerStats);
router.get("/leaderboard", auth, getOfficerLeaderboard);
router.patch("/:complaintId/assign", auth, isOfficer, assignComplaint);
router.patch("/:complaintId/reject", auth, isOfficer, rejectComplaint);
router.patch("/:complaintId/transfer", auth, isOfficer, transferComplaint);

module.exports = router;

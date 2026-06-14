const express = require("express");
const router = express.Router();

const { auth, isCitizen, isOfficer } = require("../middlewares/auth");

const {
    createComplaint,
    getAllComplaints,
    getNearbyComplaints,
    getComplaintById,
    getMyComplaints,
    updateComplaintStatus,
    resolveComplaint,
    deleteComplaint,
    getPublicStats,
    getRecentComplaints,
} = require("../controllers/Complaint");

const { toggleUpvote, getUpvoters } = require("../controllers/Upvote");

// ── Public Routes (no auth required) ─────────────────────────────────────────
router.get("/stats", getPublicStats);
router.get("/public/recent", getRecentComplaints);

// ── Citizen Routes ────────────────────────────────────────────────────────────
router.post("/", auth, isCitizen, createComplaint);
router.get("/my", auth, getMyComplaints);

// ── General Auth Routes ───────────────────────────────────────────────────────
router.get("/", auth, getAllComplaints);
router.get("/nearby", auth, getNearbyComplaints);
router.get("/:id", auth, getComplaintById);

// ── Officer / Admin Routes ────────────────────────────────────────────────────
router.patch("/:id/status", auth, isOfficer, updateComplaintStatus);
router.patch("/:id/resolve", auth, isOfficer, resolveComplaint);
router.delete("/:id", auth, deleteComplaint);

// ── Upvote Routes ─────────────────────────────────────────────────────────────
router.post("/:complaintId/upvote", auth, isCitizen, toggleUpvote);
router.get("/:complaintId/upvoters", auth, isOfficer, getUpvoters);

module.exports = router;

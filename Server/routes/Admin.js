const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middlewares/auth");
const {
    getAllUsers,
    verifyOfficer,
    getAdminStats
} = require("../controllers/Admin");

// ── Admin Routes (protected, admin role required) ────────────────────────────
router.get("/users", auth, isAdmin, getAllUsers);
router.get("/stats", auth, isAdmin, getAdminStats);
router.patch("/verify-officer/:officerId", auth, isAdmin, verifyOfficer);

module.exports = router;

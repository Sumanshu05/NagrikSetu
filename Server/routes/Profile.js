const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const {
    updateProfile,
    deleteAccount,
    getUserDetails,
    updateDisplayPicture,
} = require("../controllers/Profile");

// ── Profile Routes ────────────────────────────────────────────────────────────
router.get("/", auth, getUserDetails);
router.put("/update", auth, updateProfile);
router.delete("/delete", auth, deleteAccount);
router.put("/update-display-picture", auth, updateDisplayPicture);

module.exports = router;

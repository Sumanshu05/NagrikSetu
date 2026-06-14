const express = require("express");
const router = express.Router();
const { createReview, getAllReviews } = require("../controllers/Review");
const { auth } = require("../middlewares/auth");

router.post("/", auth, createReview);
router.get("/", getAllReviews);

module.exports = router;

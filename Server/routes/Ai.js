const express = require("express");
const router = express.Router();
const { askAi, analyzeComplaint } = require("../controllers/Ai");

// POST /api/v1/ai/query - Handle general user/citizen questions
router.post("/query", askAi);

// POST /api/v1/ai/analyze-complaint - Auto categorize and summarize complaint
router.post("/analyze-complaint", analyzeComplaint);

module.exports = router;

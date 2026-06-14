const express = require("express");
const router = express.Router();
const { contactUs, getAllContacts } = require("../controllers/Contact");
const { auth, isAdmin } = require("../middlewares/auth");

router.post("/contact", contactUs);
router.get("/all-contacts", auth, isAdmin, getAllContacts);

module.exports = router;

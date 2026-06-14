const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const notificationRoutes = require("./routes/Notification");
const complaintRoutes = require("./routes/Complaint");
const officerRoutes = require("./routes/Officer");
const adminRoutes = require("./routes/Admin");
const contactRoutes = require("./routes/Contact");
const reviewRoutes = require("./routes/Review");

const { connect } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

dotenv.config();

const PORT = process.env.PORT || 4000;

// ── Database & Cloudinary ──────────────────────────────────────────────────
connect();
cloudinaryConnect();

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
        limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
        abortOnLimit: true,
    })
);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/complaint", complaintRoutes);
app.use("/api/v1/officer", officerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/review", reviewRoutes);

// default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "NagrikSetu Server is up and running.",
    });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

app.listen(PORT, () => {
    console.log(`NagrikSetu Server running at http://localhost:${PORT}`);
});
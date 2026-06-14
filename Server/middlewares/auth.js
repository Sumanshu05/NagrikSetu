const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

// ─── Auth Middleware ──────────────────────────────────────────────────────────
exports.auth = async (req, res, next) => {
    try {
        // Extract token from Authorization header, body, or cookie
        const token =
            req.header("Authorization")?.replace("Bearer ", "").trim() ||
            req.body?.token ||
            req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token is missing.",
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            console.error("JWT verification error:", err.message);
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired",
            });
        }

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Authentication error. Please try again.",
        });
    }
};

// ─── Is Citizen ───────────────────────────────────────────────────────────────
exports.isCitizen = async (req, res, next) => {
    try {
        const userDetails = await User.findById(req.user.id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (userDetails.role !== "citizen") {
            return res.status(403).json({
                success: false,
                message: "Access restricted to citizens only",
            });
        }
        next();
    } catch (error) {
        console.error("isCitizen error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role",
        });
    }
};

// ─── Is Officer ───────────────────────────────────────────────────────────────
exports.isOfficer = async (req, res, next) => {
    try {
        const userDetails = await User.findById(req.user.id);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (userDetails.role !== "officer") {
            return res.status(403).json({
                success: false,
                message: "Access restricted to officers only",
            });
        }

        if (!userDetails.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Officer account is not verified yet",
            });
        }

        next();
    } catch (error) {
        console.error("isOfficer error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role",
        });
    }
};

// ─── Is Admin ─────────────────────────────────────────────────────────────────
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findById(req.user.id);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (userDetails.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access restricted to admins only",
            });
        }

        next();
    } catch (error) {
        console.error("isAdmin error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role",
        });
    }
};

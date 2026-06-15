const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// ─── Generate Reset Password Token ───────────────────────────────────────────
exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Email ${email} is not registered with us`,
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        await User.findOneAndUpdate(
            { email },
            {
                token,
                resetPasswordExpires: Date.now() + 3_600_000, // 1 hour
            },
            { new: true }
        );

        const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/update-password/${token}`;

        await mailSender(
            email,
            "Password Reset Link — NagrikSetu",
            `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
                <h2 style="color:#1a73e8;">🔑 Reset Your Password</h2>
                <p>Click the button below to reset your NagrikSetu password. This link expires in <strong>1 hour</strong>.</p>
                <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
                <p style="color:#888;font-size:13px;">If you didn't request this, please ignore this email.</p>
            </div>`
        );

        return res.status(200).json({
            success: true,
            message: "Password reset email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("resetPasswordToken error:", error);
        return res.status(500).json({
            success: false,
            message: "Error generating reset password link",
        });
    }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmpassword, token } = req.body;

        if (!password || !confirmpassword || !token) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match",
            });
        }

        const userDetails = await User.findOne({ token });
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid",
            });
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Reset token has expired. Please generate a new one.",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { token },
            { password: encryptedPassword, token: null, resetPasswordExpires: null },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("resetPassword error:", error);
        return res.status(500).json({
            success: false,
            message: "Error resetting password",
        });
    }
};
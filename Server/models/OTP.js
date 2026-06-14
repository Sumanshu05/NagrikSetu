const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60, // expire after 5 minutes
    },
});

// Pre-save hook: automatically send OTP email when record is created
OTPSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            await mailSender(
                this.email,
                "Your OTP — NagrikSetu",
                `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
                    <h2 style="color:#1a73e8;">🔐 Your One-Time Password</h2>
                    <p>Use the OTP below to complete your registration on <strong>NagrikSetu</strong>.</p>
                    <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a73e8;text-align:center;padding:16px 0;">
                        ${this.otp}
                    </div>
                    <p style="color:#888;font-size:13px;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                </div>`
            );
            console.log("✅ OTP Email sent to:", this.email);
        } catch (error) {
            console.error("❌ OTP Email send failed:", error.message);
        }
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);
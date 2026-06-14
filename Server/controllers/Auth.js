const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

//Send OTP 
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            });
        }

        // Generate a unique 4-digit OTP
        let otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        let result = await OTP.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
        }

        // Persist OTP (pre-save hook sends email)
        const otpBody = await OTP.create({ email, otp });
        console.log("OTP Body:", otpBody);

        return res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
        });
    } catch (error) {
        console.error("sendOTP error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error sending OTP. Please try again.",
            error: error.message,
        });
    }
};

//Sign Up 
exports.signUp = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, phoneNumber, otp } =
            req.body;

        // Validate required fields (otp and phoneNumber bypassed for dev)
        if (!name || !email || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Passwords must match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. Please try again.",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            });
        }

        // OTP Verification bypassed for development
        /*
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (response.length === 0) {
            return res.status(400).json({
                success: false,
                message: "The OTP has expired or is invalid",
            });
        } else if (otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            });
        }
        */

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            phoneNumber: phoneNumber || "0000000000",
            password: hashedPassword,
            role: role || "citizen",
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`,
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error("signUp error:", error.message);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not registered. Please sign up first.",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        // Generate JWT
        const payload = {
            email: user.email,
            id: user._id,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        user.token = token;
        user.password = undefined;

        const cookieOptions = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
        };

        return res
            .cookie("token", token, cookieOptions)
            .status(200)
            .json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            });
    } catch (error) {
        console.error("login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });
    }
};

//Change Password
exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id);
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "The old password is incorrect",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send notification email
        try {
            await mailSender(
                updatedUserDetails.email,
                "Password Updated — NagrikSetu",
                passwordUpdated(updatedUserDetails.email, updatedUserDetails.name)
            );
            console.log("Password update email sent successfully");
        } catch (emailError) {
            console.error("Error sending password update email:", emailError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("changePassword error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error updating password. Please try again.",
            error: error.message,
        });
    }
};

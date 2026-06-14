const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber, ward } = req.body;
        const id = req.user.id;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;
        if (ward) updateFields.ward = ward;

        const updatedUserDetails = await User.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).select("-password");

        if (!updatedUserDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedUserDetails,
        });
    } catch (error) {
        console.error("updateProfile error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

// ─── Delete Account ────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("deleteAccount error:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting account",
            error: error.message,
        });
    }
};

// ─── Get User Details ─────────────────────────────────────────────────────────
exports.getUserDetails = async (req, res) => {
    try {
        const id = req.user.id;

        const userDetails = await User.findById(id)
            .select("-password -token")
            .populate("ward", "name zone")
            .populate("complaintsFiled", "title status category createdAt");

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        console.error("getUserDetails error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── Update Display Picture ───────────────────────────────────────────────────
exports.updateDisplayPicture = async (req, res) => {
    try {
        if (!req.files || !req.files.displayPicture) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        const updatedProfile = await User.findByIdAndUpdate(
            userId,
            { image: image.secure_url },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("updateDisplayPicture error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

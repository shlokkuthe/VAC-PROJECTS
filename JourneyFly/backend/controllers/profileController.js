const User = require("../models/User");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const bcrypt = require("bcrypt");
const path = require("path");

// ==============================
// Update Profile Settings
// ==============================
const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, country, bio, language, notifications, theme } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Update fields if provided
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (country !== undefined) user.country = country;
        if (bio !== undefined) user.bio = bio;
        if (language !== undefined) user.language = language;
        if (notifications !== undefined) user.notifications = notifications;
        if (theme !== undefined) user.theme = theme;

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password -refreshToken");

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Change Password
// ==============================
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required.",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Upload Avatar
// ==============================
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file.",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const host = req.get("host");
        const protocol = req.protocol;
        const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        user.avatar = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: "Avatar uploaded successfully.",
            avatar: avatarUrl,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Delete Account (Cascade)
// ==============================
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Delete all user expenses
        await Expense.deleteMany({ user: userId });

        // Delete all user reviews
        await Review.deleteMany({ user: userId });

        // Delete all user notifications
        await Notification.deleteMany({ user: userId });

        // Delete all user trips
        await Trip.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.clearCookie("refreshToken");

        res.json({
            success: true,
            message: "Account and all associated trip data have been permanently deleted.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAccount,
};

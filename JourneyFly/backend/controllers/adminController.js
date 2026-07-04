const User = require("../models/User");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
const Review = require("../models/Review");

// ==============================
// Admin Stats
// ==============================
const getAdminStats = async (req, res) => {
    try {
        // Double check admin role
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
        }

        const totalUsers = await User.countDocuments();
        const totalTrips = await Trip.countDocuments();
        const totalExpensesDocs = await Expense.find();
        const totalExpenses = totalExpensesDocs.reduce((sum, e) => sum + e.amount, 0);

        // Recent Activity (system-wide)
        const recentUsers = await User.find().select("fullName email createdAt").sort({ createdAt: -1 }).limit(5);
        const recentTrips = await Trip.find().populate("user", "fullName").sort({ createdAt: -1 }).limit(5);

        const activities = [];
        recentUsers.forEach((u) => {
            activities.push({
                type: "user",
                message: `New user registered: ${u.fullName} (${u.email})`,
                date: u.createdAt,
            });
        });

        recentTrips.forEach((t) => {
            activities.push({
                type: "trip",
                message: `Trip planned to ${t.destination} by ${t.user ? t.user.fullName : "Unknown User"}`,
                date: t.createdAt,
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalTrips,
                totalExpenses,
            },
            recentActivity: activities.slice(0, 8),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Get All Users
// ==============================
const getUsersList = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
        }

        const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });

        res.json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Admin Delete User
// ==============================
const adminDeleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
        }

        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Prevent self deletion
        if (String(user._id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own admin account.",
            });
        }

        // Cascade delete
        await Expense.deleteMany({ user: id });
        await Review.deleteMany({ user: id });
        await Notification.deleteMany({ user: id });
        await Trip.deleteMany({ user: id });

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: `User ${user.fullName} and all their associated data have been permanently deleted.`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getAdminStats,
    getUsersList,
    adminDeleteUser,
};

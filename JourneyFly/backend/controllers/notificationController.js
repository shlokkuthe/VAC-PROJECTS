const Notification = require("../models/Notification");

// ==============================
// Get User Notifications
// ==============================
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Get Unread Count
// ==============================
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user.id, read: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Mark Notification as Read
// ==============================
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
        if (String(notification.user) !== req.user.id)
            return res.status(403).json({ success: false, message: "Unauthorized access." });

        notification.read = true;
        await notification.save();

        res.json({ success: true, message: "Notification marked as read.", notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Mark All as Read
// ==============================
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Delete Notification
// ==============================
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
        if (String(notification.user) !== req.user.id)
            return res.status(403).json({ success: false, message: "Unauthorized access." });

        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Notification deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };

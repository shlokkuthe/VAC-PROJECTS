const express = require("express");
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/mark-all", protect, markAllAsRead);
router.put("/:id", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    getAdminStats,
    getUsersList,
    adminDeleteUser,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");

router.get("/stats", protect, getAdminStats);
router.get("/users", protect, getUsersList);
router.delete("/users/:id", protect, adminDeleteUser);

module.exports = router;

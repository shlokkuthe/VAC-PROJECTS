const express = require("express");
const router = express.Router();
const {
    signup,
    verifyEmail,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getProfile);

module.exports = router;
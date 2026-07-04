const express = require("express");
const router = express.Router();
const {
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAccount,
} = require("../controllers/profileController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/", protect, deleteAccount);

module.exports = router;

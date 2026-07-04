const express = require("express");
const router = express.Router();
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    cancelTrip,
    restoreTrip,
    duplicateTrip,
    toggleWishlist,
    getWishlistedTrips,
} = require("../controllers/tripController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.single("tripImage"), createTrip);
router.get("/", protect.optional, getTrips);
router.get("/wishlist", protect, getWishlistedTrips);
router.get("/:id", protect.optional, getTripById);
router.put("/:id", protect, upload.single("tripImage"), updateTrip);
router.delete("/:id", protect, deleteTrip);
router.patch("/:id/cancel", protect, cancelTrip);
router.patch("/:id/restore", protect, restoreTrip);
router.post("/:id/duplicate", protect, duplicateTrip);
router.post("/:id/wishlist", protect, toggleWishlist);

module.exports = router;

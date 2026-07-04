const express = require("express");
const router = express.Router();
const { addReview, getReviewsByTrip } = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

router.post("/:tripId", protect, addReview);
router.get("/:tripId", getReviewsByTrip);

module.exports = router;

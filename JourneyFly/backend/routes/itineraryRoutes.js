const express = require("express");
const router = express.Router();
const {
    getItinerary,
    addItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
} = require("../controllers/itineraryController");
const protect = require("../middleware/authMiddleware");

router.get("/trip/:tripId", protect, getItinerary);
router.post("/", protect, addItineraryItem);
router.put("/:id", protect, updateItineraryItem);
router.delete("/:id", protect, deleteItineraryItem);

module.exports = router;

const ItineraryItem = require("../models/Itinerary");
const Trip = require("../models/Trip");

// ==============================
// Get Itinerary for a Trip
// ==============================
const getItinerary = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id && !trip.isPublic) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        const items = await ItineraryItem.find({ trip: tripId })
            .sort({ day: 1, timeOfDay: 1 });

        // Group by day
        const grouped = {};
        items.forEach((item) => {
            if (!grouped[item.day]) grouped[item.day] = { Morning: [], Afternoon: [], Evening: [], Night: [] };
            grouped[item.day][item.timeOfDay].push(item);
        });

        res.json({ success: true, items, grouped });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Add Itinerary Item
// ==============================
const addItineraryItem = async (req, res) => {
    try {
        const { tripId, day, timeOfDay, title, description, location, duration } = req.body;

        if (!tripId || !day || !timeOfDay || !title) {
            return res.status(400).json({ success: false, message: "tripId, day, timeOfDay, and title are required." });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        const item = await ItineraryItem.create({
            trip: tripId,
            user: req.user.id,
            day: Number(day),
            timeOfDay,
            title,
            description: description || "",
            location: location || "",
            duration: duration || "",
        });

        res.status(201).json({ success: true, message: "Itinerary item added.", item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Update Itinerary Item
// ==============================
const updateItineraryItem = async (req, res) => {
    try {
        const item = await ItineraryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found." });

        if (String(item.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        const { day, timeOfDay, title, description, location, duration } = req.body;
        if (day !== undefined) item.day = Number(day);
        if (timeOfDay) item.timeOfDay = timeOfDay;
        if (title) item.title = title;
        if (description !== undefined) item.description = description;
        if (location !== undefined) item.location = location;
        if (duration !== undefined) item.duration = duration;

        await item.save();
        res.json({ success: true, message: "Itinerary item updated.", item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Delete Itinerary Item
// ==============================
const deleteItineraryItem = async (req, res) => {
    try {
        const item = await ItineraryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found." });

        if (String(item.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        await ItineraryItem.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Itinerary item deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem };

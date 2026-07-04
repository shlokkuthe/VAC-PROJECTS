const Review = require("../models/Review");
const Trip = require("../models/Trip");
const Notification = require("../models/Notification");

// ==============================
// Create Review
// ==============================
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { tripId } = req.params;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating (1-5) and comment are required.",
            });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found.",
            });
        }

        // Allow reviews ONLY on public trips
        if (!trip.isPublic && String(trip.user) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Reviews can only be added to public trips.",
            });
        }

        const review = await Review.create({
            user: req.user.id,
            trip: tripId,
            rating: Number(rating),
            comment,
        });

        // Trigger Notification for the Trip Owner if someone else leaves a review
        if (String(trip.user) !== req.user.id) {
            await Notification.create({
                user: trip.user,
                title: "New Review on Your Trip! ⭐",
                message: `Someone left a ${rating}-star review on your trip to ${trip.destination}.`,
                type: "review",
            });
        }

        res.status(201).json({
            success: true,
            message: "Review added successfully.",
            review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Get Reviews for Trip
// ==============================
const getReviewsByTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const reviews = await Review.find({ trip: tripId })
            .populate("user", "fullName avatar")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addReview,
    getReviewsByTrip,
};

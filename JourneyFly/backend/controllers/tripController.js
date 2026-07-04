const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");

// ==============================
// Create Trip
// ==============================
const createTrip = async (req, res) => {
    try {
        const {
            tripName,
            destination,
            country,
            city,
            tripType,
            budget,
            startDate,
            endDate,
            transportation,
            description,
            travelers,
            status,
            isPublic,
        } = req.body;

        if (!tripName || !destination || !country || !city || !budget || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required trip fields.",
            });
        }

        let tripImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
        if (req.file) {
            const host = req.get("host");
            const protocol = req.protocol;
            tripImage = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const trip = await Trip.create({
            user: req.user.id,
            tripName,
            destination,
            country,
            city,
            tripType: tripType || "Leisure",
            budget: Number(budget),
            startDate,
            endDate,
            transportation: transportation || "Flight",
            description: description || "",
            tripImage,
            travelers: Number(travelers) || 1,
            status: status || "Upcoming",
            isPublic: isPublic === "true" || isPublic === true,
        });

        await Notification.create({
            user: req.user.id,
            title: "New Trip Planned ✈️",
            message: `You successfully planned "${tripName}" to ${destination}, ${country}!`,
            type: "trip",
        });

        res.status(201).json({
            success: true,
            message: "Trip created successfully.",
            trip,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Get All User Trips (with search, filter, pagination)
// ==============================
const getTrips = async (req, res) => {
    try {
        const {
            search,
            status,
            tripType,
            minBudget,
            maxBudget,
            page = 1,
            limit = 6,
            isPublic,
        } = req.query;
        const query = {};

        if (isPublic === "true") {
            query.isPublic = true;
        } else {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required to view private trips.",
                });
            }
            query.user = req.user.id;
        }

        if (search) {
            query.$or = [
                { tripName: { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
            ];
        }

        if (status) query.status = status;
        if (tripType) query.tripType = tripType;

        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget) query.budget.$gte = Number(minBudget);
            if (maxBudget) query.budget.$lte = Number(maxBudget);
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const total = await Trip.countDocuments(query);
        const trips = await Trip.find(query)
            .populate("user", "fullName avatar")
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            trips,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Get Trip By ID
// ==============================
const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate("user", "fullName avatar email")
            .populate({ path: "wishlistedBy", select: "fullName avatar" });

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        const isOwner = req.user && String(trip.user._id || trip.user) === req.user.id;
        if (!isOwner && !trip.isPublic) {
            return res.status(403).json({ success: false, message: "Access Denied: Private Trip." });
        }

        const expenses = await Expense.find({ trip: trip._id }).populate("user", "fullName avatar");
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remainingBudget = trip.budget - totalExpense;
        const percentageUsed = trip.budget > 0 ? Math.round((totalExpense / trip.budget) * 100) : 0;

        res.json({
            success: true,
            trip,
            expenses,
            summary: {
                totalBudget: trip.budget,
                totalExpense,
                remainingBudget,
                percentageUsed,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Update Trip
// ==============================
const updateTrip = async (req, res) => {
    try {
        const {
            tripName,
            destination,
            country,
            city,
            tripType,
            budget,
            startDate,
            endDate,
            transportation,
            description,
            travelers,
            status,
            isPublic,
        } = req.body;

        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        if (tripName) trip.tripName = tripName;
        if (destination) trip.destination = destination;
        if (country) trip.country = country;
        if (city) trip.city = city;
        if (tripType) trip.tripType = tripType;
        if (budget !== undefined) trip.budget = Number(budget);
        if (startDate) trip.startDate = startDate;
        if (endDate) trip.endDate = endDate;
        if (transportation) trip.transportation = transportation;
        if (description !== undefined) trip.description = description;
        if (travelers !== undefined) trip.travelers = Number(travelers);
        if (status) trip.status = status;
        if (isPublic !== undefined) trip.isPublic = isPublic === "true" || isPublic === true;

        if (req.file) {
            const host = req.get("host");
            const protocol = req.protocol;
            trip.tripImage = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        await trip.save();

        res.json({ success: true, message: "Trip updated successfully.", trip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Delete Trip (Cascade)
// ==============================
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        await Expense.deleteMany({ trip: trip._id });
        await Trip.findByIdAndDelete(trip._id);

        res.json({ success: true, message: "Trip and all its expenses have been deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Cancel Trip
// ==============================
const cancelTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        if (trip.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Trip is already cancelled." });
        }

        trip.status = "Cancelled";
        await trip.save();

        await Notification.create({
            user: req.user.id,
            title: "Trip Cancelled ❌",
            message: `Your trip "${trip.tripName || trip.destination}" has been cancelled.`,
            type: "trip",
        });

        res.json({ success: true, message: "Trip cancelled successfully.", trip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Restore Cancelled Trip
// ==============================
const restoreTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        if (trip.status !== "Cancelled") {
            return res.status(400).json({ success: false, message: "Only cancelled trips can be restored." });
        }

        trip.status = "Upcoming";
        await trip.save();

        await Notification.create({
            user: req.user.id,
            title: "Trip Restored ✅",
            message: `Your trip "${trip.tripName || trip.destination}" has been restored and is now upcoming!`,
            type: "trip",
        });

        res.json({ success: true, message: "Trip restored successfully.", trip });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Duplicate Trip
// ==============================
const duplicateTrip = async (req, res) => {
    try {
        const original = await Trip.findById(req.params.id);

        if (!original) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(original.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        const duplicate = await Trip.create({
            user: req.user.id,
            tripName: `Copy of ${original.tripName || original.destination}`,
            destination: original.destination,
            country: original.country,
            city: original.city,
            tripType: original.tripType,
            budget: original.budget,
            startDate: original.startDate,
            endDate: original.endDate,
            transportation: original.transportation,
            description: original.description,
            tripImage: original.tripImage,
            travelers: original.travelers,
            status: "Draft",
            isPublic: false,
        });

        res.status(201).json({ success: true, message: "Trip duplicated successfully.", trip: duplicate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Toggle Wishlist
// ==============================
const toggleWishlist = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        const userId = req.user.id;
        const index = trip.wishlistedBy.findIndex(id => id.toString() === userId.toString());

        let isWishlisted = false;
        if (index > -1) {
            trip.wishlistedBy.splice(index, 1);
        } else {
            trip.wishlistedBy.push(userId);
            isWishlisted = true;
        }

        await trip.save();

        res.json({
            success: true,
            message: isWishlisted ? "Trip added to wishlist." : "Trip removed from wishlist.",
            isWishlisted,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Get Wishlisted Trips
// ==============================
const getWishlistedTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ wishlistedBy: req.user.id })
            .populate("user", "fullName avatar")
            .sort({ createdAt: -1 });

        res.json({ success: true, trips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
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
};

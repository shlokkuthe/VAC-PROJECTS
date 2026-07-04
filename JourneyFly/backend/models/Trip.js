const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        tripName: {
            type: String,
            required: true,
            trim: true,
        },

        destination: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        tripType: {
            type: String,
            enum: ["Adventure", "Business", "Leisure", "Honeymoon", "Family", "Solo", "Other"],
            default: "Leisure",
        },

        budget: {
            type: Number,
            required: true,
            min: 0,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        transportation: {
            type: String,
            enum: ["Flight", "Train", "Bus", "Car", "Other"],
            default: "Flight",
        },

        description: {
            type: String,
            default: "",
        },

        tripImage: {
            type: String,
            default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        },

        travelers: {
            type: Number,
            default: 1,
            min: 1,
        },

        status: {
            type: String,
            enum: ["Draft", "Upcoming", "Ongoing", "Completed", "Cancelled"],
            default: "Upcoming",
        },

        isPublic: {
            type: Boolean,
            default: false,
        },

        wishlistedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Trip", tripSchema);

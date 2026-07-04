const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
    {
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        day: {
            type: Number,
            required: true,
            min: 1,
        },

        timeOfDay: {
            type: String,
            enum: ["Morning", "Afternoon", "Evening", "Night"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },

        duration: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ItineraryItem", itineraryItemSchema);

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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

        category: {
            type: String,
            enum: [
                "Hotel",
                "Food",
                "Flight",
                "Train",
                "Bus",
                "Taxi",
                "Fuel",
                "Shopping",
                "Activities",
                "Medical",
                "Other",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            default: "",
        },

        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);

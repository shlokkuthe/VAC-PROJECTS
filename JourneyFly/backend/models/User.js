const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            default: "",
        },

        country: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
        },

        avatar: {
            type: String,
            default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        },

        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        },

        language: {
            type: String,
            default: "English",
        },

        notifications: {
            type: Boolean,
            default: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationToken: {
            type: String,
        },

        verificationExpires: {
            type: Date,
        },

        resetPasswordToken: {
            type: String,
        },

        resetPasswordExpires: {
            type: Date,
        },

        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { sendEmail } = require("../services/emailService");

// Cookie options for Refresh Token
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ==============================
// Signup
// ==============================
const signup = async (req, res) => {
    try {
        const { fullName, username, email, password, phone, country } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
            });
        }

        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: "Username already taken.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = await User.create({
            fullName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || "",
            country: country || "",
            verificationToken,
            verificationExpires,
            isVerified: false,
        });

        // Send Email
        const frontendUrl = "http://localhost:3000";
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        const emailContent = `
            <h3>Welcome to JourneyFly, ${fullName}!</h3>
            <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
            <p><a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background:#2563EB;color:#FFF;text-decoration:none;border-radius:5px;">Verify Email</a></p>
            <p>Or copy this link to your browser:</p>
            <p>${verificationLink}</p>
            <p>This link is valid for 24 hours.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: "Verify Your Email - JourneyFly",
            html: emailContent,
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: "Registration successful! A verification email has been sent.",
            accessToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Verify Email
// ==============================
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required.",
            });
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Verification token is invalid or has expired.",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Email verified successfully! You can now log in.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Login
// ==============================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password.",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        res.json({
            success: true,
            message: "Logged in successfully.",
            accessToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                theme: user.theme,
                role: user.role,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Refresh Token
// ==============================
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is missing.",
            });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token.",
            });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || decoded.id !== String(user._id)) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token is invalid or expired.",
                });
            }

            const accessToken = generateAccessToken(user._id);
            res.json({
                success: true,
                accessToken,
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Logout
// ==============================
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (refreshToken) {
            const user = await User.findOne({ refreshToken });
            if (user) {
                user.refreshToken = undefined;
                await user.save();
            }
        }

        res.clearCookie("refreshToken");
        res.json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Forgot Password
// ==============================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email.",
            });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const frontendUrl = "http://localhost:3000";
        const resetLink = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;
        const emailContent = `
            <h3>Reset Your Password</h3>
            <p>You requested a password reset. Click the button below to change your password:</p>
            <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#2563EB;color:#FFF;text-decoration:none;border-radius:5px;">Reset Password</a></p>
            <p>Or copy this link to your browser:</p>
            <p>${resetLink}</p>
            <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: "Reset Password - JourneyFly",
            html: emailContent,
        });

        res.json({
            success: true,
            message: "Password reset link sent to your email.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Reset Password
// ==============================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required.",
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid or has expired.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully! You can now log in.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==============================
// Get Logged-in User
// ==============================
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -refreshToken");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    signup,
    verifyEmail,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    getProfile,
};
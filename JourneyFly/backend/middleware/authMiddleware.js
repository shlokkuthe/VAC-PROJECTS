const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: No token provided.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch full user from DB to get role and other fields
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Access Denied: User not found.",
            });
        }

        // Attach full user object to req (id as string, plus role etc.)
        req.user = {
            id: String(user._id),
            role: user.role,
            email: user.email,
            fullName: user.fullName,
        };

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: Invalid or expired token.",
        });
    }
};

const optionalProtect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if (!user) {
            req.user = null;
            return next();
        }

        req.user = {
            id: String(user._id),
            role: user.role,
            email: user.email,
            fullName: user.fullName,
        };
        next();
    } catch (err) {
        // If token is present but expired/invalid, let's return 401 so frontend can trigger refresh
        return res.status(401).json({
            success: false,
            message: "Access Denied: Invalid or expired token.",
        });
    }
};

protect.optional = optionalProtect;

module.exports = protect;
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.indexOf(origin) !== -1 ||
                /^http:\/\/localhost:\d+$/.test(origin) ||
                /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
            ) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({ success: true, message: "JourneyFly Backend Running 🚀" });
});

// Mount Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/itinerary", require("./routes/itineraryRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((req, res, next) => {
    res.status(404);
    next(new Error(`API endpoint not found: ${req.originalUrl}`));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
});
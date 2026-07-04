const express = require("express");
const router = express.Router();
const { getWeatherData } = require("../controllers/weatherController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getWeatherData);

module.exports = router;

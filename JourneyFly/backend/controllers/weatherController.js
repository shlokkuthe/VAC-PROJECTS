// ==============================
// Weather API Controller
// ==============================

const getWeatherData = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City query parameter is required.",
            });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;

        // If apiKey exists, try calling OpenWeatherMap API
        if (apiKey) {
            try {
                // Fetch Current Weather
                const currentRes = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
                );
                const currentData = await currentRes.json();

                if (currentRes.ok) {
                    // Fetch 5-day Forecast
                    const forecastRes = await fetch(
                        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
                    );
                    const forecastData = await forecastRes.json();

                    const weatherInfo = {
                        temperature: Math.round(currentData.main.temp),
                        humidity: currentData.main.humidity,
                        wind: Math.round(currentData.wind.speed * 3.6), // convert m/s to km/h
                        description: currentData.weather[0].description,
                        icon: currentData.weather[0].icon,
                        cityName: currentData.name,
                        forecast: [],
                    };

                    if (forecastRes.ok && forecastData.list) {
                        // Filter forecast lists for 1 per day (around 12:00 PM)
                        const filteredForecast = forecastData.list.filter((item) =>
                            item.dt_txt.includes("12:00:00")
                        );

                        weatherInfo.forecast = filteredForecast.map((item) => {
                            const date = new Date(item.dt * 1000);
                            return {
                                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                                temp: Math.round(item.main.temp),
                                condition: item.weather[0].main,
                                description: item.weather[0].description,
                                icon: item.weather[0].icon,
                            };
                        });
                    }

                    return res.json({
                        success: true,
                        source: "OpenWeatherMap API",
                        weather: weatherInfo,
                    });
                }
            } catch (apiError) {
                console.warn("⚠️ Weather API call failed, falling back to mock:", apiError.message);
            }
        }

        // Mock/Fallback Weather Data Generation (if no key or API call fails)
        const mockConditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Windy"];
        const mockDescriptions = [
            "clear sky",
            "scattered clouds",
            "moderate rain",
            "few clouds",
            "gentle breeze",
        ];

        // Seed-like generation based on city letters to keep it consistent
        const charSum = city.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const conditionIndex = charSum % mockConditions.length;

        const baseTemp = 18 + (charSum % 15); // 18 to 33 deg C
        const humidity = 45 + (charSum % 40); // 45 to 85%
        const wind = 5 + (charSum % 25); // 5 to 30 km/h

        const forecast = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDayIndex = new Date().getDay();

        for (let i = 1; i <= 5; i++) {
            const dayName = days[(currentDayIndex + i) % 7];
            const tempVar = -4 + ((charSum + i) % 9); // -4 to +4 variation
            const condIdx = (conditionIndex + i) % mockConditions.length;

            forecast.push({
                day: dayName,
                temp: baseTemp + tempVar,
                condition: mockConditions[condIdx],
                description: mockDescriptions[condIdx],
                icon: "02d", // standard cloudy/sunny icon
            });
        }

        res.json({
            success: true,
            source: "Mock Simulator (No API Key)",
            weather: {
                temperature: baseTemp,
                humidity,
                wind,
                description: mockDescriptions[conditionIndex],
                icon: "01d",
                cityName: city.charAt(0).toUpperCase() + city.slice(1),
                forecast,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { getWeatherData };

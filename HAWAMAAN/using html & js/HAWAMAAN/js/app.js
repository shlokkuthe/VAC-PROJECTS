// ==========================================
// HAWAMAAN - Weather Intelligence Dashboard
// Core Application Script
// ==========================================

const state = {
    activeCity: "Nagpur",
    searchHistory: JSON.parse(localStorage.getItem("hawamaan_history")) || ["Nagpur", "Mumbai", "Pune", "Delhi", "Bengaluru"],
    compareCities: [
        { city: "Nagpur", temp: "--", humidity: "--", wind: "--" },
        { city: "Mumbai", temp: "--", humidity: "--", wind: "--" },
        { city: "Pune", temp: "--", humidity: "--", wind: "--" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initTheme();
    initScrollToTop();
    initSearch();
    initCompare();
    initScrollReveal();
    initLoader();
    loadCityWeather(state.activeCity);
    loadCompareWeather();
    setTimeout(() => showToast("Welcome to HAWAMAAN 🌤"), 1000);
});

function initLoader() {
    window.addEventListener("load", () => {
        setTimeout(() => {
            const loader = document.getElementById("loader");
            if (loader) loader.style.display = "none";
        }, 1200);
    });
}

function initClock() {
    const clockEl = document.getElementById("clock");
    const updateClock = () => {
        clockEl.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };
    setInterval(updateClock, 1000);
    updateClock();
}

function initTheme() {
    const themeBtn = document.getElementById("themeBtn");
    const updateThemeUI = (isDark) => {
        document.body.classList.toggle("dark", isDark);
        themeBtn.innerHTML = isDark ? "☀️" : "🌙";
    };
    updateThemeUI(localStorage.getItem("hawamaan_theme") === "dark");
    themeBtn.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark");
        updateThemeUI(isDark);
        localStorage.setItem("hawamaan_theme", isDark ? "dark" : "light");
    });
}

function initScrollToTop() {
    const btn = document.createElement("button");
    btn.innerHTML = "⬆";
    btn.id = "topButton";
    document.body.appendChild(btn);
    window.addEventListener("scroll", () => btn.style.display = window.scrollY > 300 ? "flex" : "none");
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => toast.classList.remove("show"), 3000);
    setTimeout(() => toast.remove(), 3500);
}

function initScrollReveal() {
    const sections = document.querySelectorAll("section");
    const reveal = () => {
        sections.forEach(sec => {
            if (window.scrollY > sec.offsetTop - window.innerHeight + 150) {
                sec.classList.add("visible");
            }
        });
    };
    window.addEventListener("scroll", reveal);
    setTimeout(reveal, 1500);
}

function initSearch() {
    const input = document.getElementById("city");
    const btn = document.getElementById("searchBtn");
    const dateEl = document.createElement("p");
    dateEl.className = "hero-date";
    dateEl.innerHTML = new Date().toDateString();
    document.querySelector(".hero").appendChild(dateEl);
    renderHistory();

    const doSearch = () => {
        const city = input.value.trim();
        if (!city) {
            showToast("⚠️ Please enter a city name.");
            input.focus();
            return;
        }
        loadCityWeather(city);
        input.value = "";
    };
    btn.addEventListener("click", doSearch);
    input.addEventListener("keydown", (e) => e.key === "Enter" && doSearch());
}

function renderHistory() {
    let box = document.getElementById("history");
    if (!box) {
        box = document.createElement("div");
        box.id = "history";
        document.querySelector(".hero").appendChild(box);
    }
    if (state.searchHistory.length === 0) return box.innerHTML = "";
    box.innerHTML = "<h3>Recent Searches</h3>";
    state.searchHistory.forEach(city => {
        const btn = document.createElement("button");
        btn.innerHTML = city;
        btn.onclick = () => loadCityWeather(city);
        box.appendChild(btn);
    });
}

function addToHistory(city) {
    const name = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    state.searchHistory = [name, ...state.searchHistory.filter(c => c.toLowerCase() !== name.toLowerCase())].slice(0, 5);
    localStorage.setItem("hawamaan_history", JSON.stringify(state.searchHistory));
    renderHistory();
}

async function loadCityWeather(city) {
    state.activeCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const BASE = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST = "https://api.openweathermap.org/data/2.5/forecast";
    let weatherData = null, forecastData = null, isMock = false;

    try {
        const res = await fetch(`${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        if (!res.ok) throw new Error("City not found");
        weatherData = await res.json();
        if (city.toLowerCase() === "chandrapur" && weatherData.name.toLowerCase() === "chanda") {
            weatherData.name = "Chandrapur";
        }
        const fRes = await fetch(`${FORECAST}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        if (fRes.ok) forecastData = await fRes.json();
    } catch (e) {
        console.warn(`Fallback to mock for ${city}:`, e);
        isMock = true;
        weatherData = generateMockWeather(city);
        forecastData = generateMockForecast(city);
    }

    displayCurrentWeather(weatherData, isMock);
    if (forecastData) displayForecast(forecastData);
    if (weatherData?.name) addToHistory(weatherData.name);
}

function displayCurrentWeather(data, isMock) {
    if (!data) return;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const condition = data.weather[0].main;
    const desc = data.weather[0].description;
    const sunriseSec = data.sys?.sunrise || (Math.floor(Date.now() / 1000) - 10000);
    const sunsetSec = data.sys?.sunset || (Math.floor(Date.now() / 1000) + 20000);
    const observationTime = data.dt || Math.floor(Date.now() / 1000);

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temp").textContent = `${temp}°C`;
    document.getElementById("feel").textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById("condition").textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("wind").textContent = isMock ? `${windSpeed} km/h` : `${Math.round(windSpeed * 3.6)} km/h`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    document.getElementById("visibility").textContent = `${data.visibility / 1000} km`;
    document.getElementById("clouds").textContent = `${data.clouds.all}%`;

    document.getElementById("feelsLikeCard").textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById("dewPoint").textContent = `${Math.round(temp - ((100 - humidity) / 5))}°C`;
    
    const gust = data.wind.gust ? (isMock ? data.wind.gust : data.wind.gust * 3.6) : (isMock ? windSpeed * 1.3 : windSpeed * 3.6 * 1.3);
    document.getElementById("gustSpeed").textContent = `${Math.round(gust)} km/h`;

    const metrics = calculateAirAndUV(condition, sunriseSec, sunsetSec, observationTime);
    const [aqiCard, uvCard] = document.querySelectorAll(".two-grid .glass");
    aqiCard.querySelector("h1").textContent = metrics.aqi;
    aqiCard.querySelector("p").textContent = metrics.aqiStatus;
    uvCard.querySelector("h1").textContent = metrics.uv;
    uvCard.querySelector("p").textContent = metrics.uvStatus;
    
    // Dynamically update UV Risk highlight card
    document.getElementById("uvRisk").textContent = metrics.uvStatus;

    const formatTime = sec => new Date(sec * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    document.querySelector(".sun .glass:nth-child(1) h1").textContent = formatTime(sunriseSec);
    document.querySelector(".sun .glass:nth-child(2) h1").textContent = formatTime(sunsetSec);

    updateWeatherIcon(condition);
    const isNight = observationTime < sunriseSec || observationTime > sunsetSec;
    updateWeatherTheme(condition, isNight);
    weatherToastMessage(temp, isMock);
}

function calculateAirAndUV(condition, sunriseSec, sunsetSec, dtSec) {
    const isNight = dtSec < sunriseSec || dtSec > sunsetSec;
    let aqi = 35, uv = 5;

    switch (condition) {
        case "Clear": aqi = Math.floor(Math.random() * 20 + 25); break;
        case "Clouds": aqi = Math.floor(Math.random() * 30 + 40); break;
        case "Rain":
        case "Drizzle": aqi = Math.floor(Math.random() * 15 + 15); break;
        case "Thunderstorm": aqi = Math.floor(Math.random() * 20 + 30); break;
        default: aqi = Math.floor(Math.random() * 80 + 75);
    }

    if (isNight) {
        uv = 0;
    } else {
        switch (condition) {
            case "Clear": uv = Math.floor(Math.random() * 3 + 7); break;
            case "Clouds": uv = Math.floor(Math.random() * 3 + 3); break;
            case "Rain":
            case "Drizzle":
            case "Thunderstorm": uv = Math.floor(Math.random() * 2 + 1); break;
            default: uv = Math.floor(Math.random() * 2 + 2);
        }
    }

    const aqiStatus = aqi > 150 ? "Unhealthy" : aqi > 100 ? "Unhealthy for Sensitive Groups" : aqi > 50 ? "Moderate" : "Good";
    const uvStatus = uv > 7 ? "Very High" : uv > 5 ? "High" : uv > 2 ? "Moderate" : "Low";
    return { aqi, aqiStatus, uv, uvStatus };
}

function updateWeatherTheme(condition, isNight) {
    document.body.classList.remove("sunny", "cloudy", "rainy", "night");
    if (isNight) {
        document.body.classList.add("night");
        return;
    }
    const cond = condition.toLowerCase();
    if (cond.includes("clear") || cond.includes("sun")) document.body.classList.add("sunny");
    else if (cond.includes("cloud")) document.body.classList.add("cloudy");
    else if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("storm")) document.body.classList.add("rainy");
    else document.body.classList.add("night");
}

function updateWeatherIcon(condition) {
    const iconEl = document.querySelector(".icon");
    if (!iconEl) return;
    const emojis = { Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️" };
    iconEl.innerHTML = emojis[condition] || "🌤️";
}

function weatherToastMessage(temp, isMock) {
    const note = isMock ? " (Simulated Data)" : "";
    if (temp >= 35) showToast(`🔥 Stay Hydrated Today! Temp is ${temp}°C${note}`);
    else if (temp >= 30) showToast(`😎 Nice Weather! Temp is ${temp}°C${note}`);
    else if (temp >= 20) showToast(`🌤 Pleasant Weather! Temp is ${temp}°C${note}`);
    else showToast(`🥶 It's Cold Outside! Temp is ${temp}°C${note}`);
}

function displayForecast(data) {
    const hourly = document.getElementById("hourlyForecast");
    const weekly = document.getElementById("weeklyForecast");
    hourly.innerHTML = "";
    weekly.innerHTML = "";

    data.list.slice(0, 8).forEach(hour => {
        hourly.innerHTML += `
            <div class="hour-card">
                <h3>${hour.dt_txt.substring(11, 16)}</h3>
                <div class="forecast-icon">${getWeatherEmoji(hour.weather[0].main)}</div>
                <h2>${Math.round(hour.main.temp)}°C</h2>
            </div>
        `;
    });

    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];
        const dayName = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "long" });
        weekly.innerHTML += `
            <div class="day">
                <h3>${dayName}</h3>
                <div class="forecast-icon">${getWeatherEmoji(day.weather[0].main)}</div>
                <p>${Math.round(day.main.temp_max)}°C</p>
            </div>
        `;
    }
}

function getWeatherEmoji(cond) {
    const emojis = { Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Thunderstorm: "⛈️", Snow: "❄️", Drizzle: "🌦️" };
    return emojis[cond] || "🌤️";
}

function generateMockWeather(city) {
    const conds = ["Clear", "Clouds", "Rain", "Drizzle", "Thunderstorm", "Snow"];
    const condition = conds[Math.floor(Math.random() * conds.length)];
    const temp = Math.floor(Math.random() * 15 + 20);
    const humidity = Math.floor(Math.random() * 40 + 50);
    const windSpeed = Math.floor(Math.random() * 20 + 5);
    const sunrise = new Date().setHours(5, 42, 0) / 1000;
    const sunset = new Date().setHours(18, 58, 0) / 1000;

    return {
        name: city,
        dt: Math.floor(Date.now() / 1000),
        main: { temp, feels_like: temp + (Math.random() > 0.5 ? 1 : -1), humidity, pressure: Math.floor(Math.random() * 20 + 995) },
        weather: [{ main: condition, description: `${condition.toLowerCase()} sky` }],
        wind: { speed: windSpeed, gust: windSpeed * 1.3 },
        visibility: Math.floor(Math.random() * 8 + 3) * 1000,
        clouds: { all: Math.floor(Math.random() * 100) },
        sys: { sunrise, sunset }
    };
}

function generateMockForecast(city) {
    const list = [];
    const now = Date.now();
    const conds = ["Clear", "Clouds", "Rain", "Drizzle"];
    for (let i = 0; i < 40; i++) {
        const time = new Date(now + i * 3 * 3600 * 1000);
        const temp = Math.floor(Math.random() * 10 + 22);
        const cond = conds[Math.floor(Math.random() * conds.length)];
        list.push({
            dt_txt: time.toISOString().replace('T', ' ').substring(0, 19),
            main: { temp, temp_max: temp + 2, temp_min: temp - 2 },
            weather: [{ main: cond, description: cond.toLowerCase() }]
        });
    }
    return { list };
}

function initCompare() {
    const navLinks = document.querySelectorAll(".navbar a");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(item => item.classList.remove("active-link"));
            this.classList.add("active-link");
        });
    });
}

async function loadCompareWeather() {
    const BASE = "https://api.openweathermap.org/data/2.5/weather";
    for (const entry of state.compareCities) {
        try {
            const res = await fetch(`${BASE}?q=${encodeURIComponent(entry.city)}&appid=${API_KEY}&units=metric`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (entry.city.toLowerCase() === "chandrapur" && data.name.toLowerCase() === "chanda") {
                data.name = "Chandrapur";
            }
            entry.temp = `${Math.round(data.main.temp)}°C`;
            entry.humidity = `${data.main.humidity}%`;
            entry.wind = `${Math.round(data.wind.speed * 3.6)} km/h`;
        } catch {
            entry.temp = `${Math.floor(Math.random() * 10 + 25)}°C`;
            entry.humidity = `${Math.floor(Math.random() * 50 + 40)}%`;
            entry.wind = `${Math.floor(Math.random() * 15 + 5)} km/h`;
        }
    }
    displayCompareTable();
}

function displayCompareTable() {
    const table = document.querySelector("#compare table");
    if (!table) return;
    table.innerHTML = `
        <tr>
            <th>City</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Wind Speed</th>
        </tr>
        ${state.compareCities.map(c => `
            <tr>
                <td>${c.city}</td>
                <td>${c.temp}</td>
                <td>${c.humidity}</td>
                <td>${c.wind}</td>
            </tr>
        `).join("")}
    `;
}

window.addCity = async function() {
    const city = prompt("Enter City Name");
    if (!city || !city.trim()) return;
    const name = city.trim().charAt(0).toUpperCase() + city.trim().slice(1).toLowerCase();

    if (state.compareCities.some(c => c.city.toLowerCase() === name.toLowerCase())) {
        showToast("⚠️ City already added in comparison table.");
        return;
    }

    showToast(`Fetching comparison data for ${name}...`);
    const newEntry = { city: name, temp: "Loading...", humidity: "Loading...", wind: "Loading..." };
    state.compareCities.push(newEntry);
    displayCompareTable();

    const BASE = "https://api.openweathermap.org/data/2.5/weather";
    try {
        const res = await fetch(`${BASE}?q=${encodeURIComponent(name)}&appid=${API_KEY}&units=metric`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (name.toLowerCase() === "chandrapur" && data.name.toLowerCase() === "chanda") {
            data.name = "Chandrapur";
        }
        newEntry.temp = `${Math.round(data.main.temp)}°C`;
        newEntry.humidity = `${data.main.humidity}%`;
        newEntry.wind = `${Math.round(data.wind.speed * 3.6)} km/h`;
    } catch {
        newEntry.temp = `${Math.floor(Math.random() * 10 + 25)}°C`;
        newEntry.humidity = `${Math.floor(Math.random() * 50 + 40)}%`;
        newEntry.wind = `${Math.floor(Math.random() * 15 + 5)} km/h`;
    }
    displayCompareTable();
};

window.removeCity = function() {
    if (state.compareCities.length > 0) {
        state.compareCities.pop();
        displayCompareTable();
    } else {
        showToast("No cities left to remove.");
    }
};

window.toggleFeedbackModal = function() {
    const modal = document.getElementById("feedbackModal");
    if (!modal) return;
    const isVisible = modal.style.display === "flex";
    modal.style.display = isVisible ? "none" : "flex";
};

window.submitFeedback = function(event) {
    event.preventDefault();
    const name = document.getElementById("fbName").value;
    const features = document.getElementById("fbFeatures").value;
    const comment = document.getElementById("fbComment").value;
    
    console.log("Feedback submitted:", { name, features, comment });
    
    showToast(`Thank you for your feedback, ${name}! 🚀`);
    
    document.getElementById("feedbackForm").reset();
    window.toggleFeedbackModal();
};

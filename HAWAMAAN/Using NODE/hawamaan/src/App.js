import { useState, useEffect } from "react";
import { initializeWeather } from "./weather";
import "./config";
import "./App.css";
import "./responsive.css"

function App() {

  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    initializeWeather();
  }, []);

  return (
    <>
      {/* ================= LOADER ================= */}

      <div id="loader">
        <div className="loader-content">
          <div className="loader-circle"></div>
          <h1>HAWAMAAN</h1>
          <p>Loading Weather Dashboard...</p>
        </div>
      </div>

      {/* ================= NAVBAR ================= */}

      <header>
        <nav className="navbar">
          <div className="logo">
            <h1>🌤 HAWAMAAN</h1>
          </div>

          <ul>
            <li>
              <a href="#current">Current</a>
            </li>
            <li>
              <a href="#forecast">Forecast</a>
            </li>
            <li>
              <a href="#compare">Compare</a>
            </li>
          </ul>

          <div className="nav-right">
            <span id="clock">12:00 PM</span>
            <button
              id="themeBtn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>
      </header>

      {/* ================= PROBLEM ================= */}

      <section className="problem">
        <h2>Problem Statement</h2>
        <p>
          Design and develop a responsive Weather Intelligence Dashboard using
          HTML, CSS and JavaScript. The dashboard displays Current Weather,
          Hourly Forecast, Weekly Forecast, Air Quality Index (AQI), UV Index,
          Sunrise &amp; Sunset timings and compares weather between multiple
          cities.
        </p>
      </section>

      {/* ================= HERO ================= */}

      <section className="hero">
        <h1>Weather Intelligence Dashboard</h1>

        <div className="search">
          <input type="text" id="city" placeholder="Enter City Name"/>
          <button id="searchBtn">Search</button>
        </div>
      </section>

      {/* ================= CURRENT WEATHER ================= */}

      <section id="current" className="current">
        <h2>Current Weather</h2>

        <div className="current-card">
          <div className="left">
            <div className="icon">☀️</div>
          </div>

          <div className="right">
            <h3 id="cityName">Nagpur</h3>

            <h1 id="temp">30°C</h1>

            <p id="condition">Clear Sky</p>

            <p>
              Feels Like{" "}
              <span id="feel">32°C</span>
            </p>
          </div>
        </div>
      </section>

      {/* ================= TODAY'S HIGHLIGHTS ================= */}

      <section className="highlights">
        <h2>Today's Highlights</h2>

        <div className="highlight-container">
          <div className="highlight-card">
            <h3>🌡 Feels Like</h3>
            <h1 id="feelsLikeCard">32°C</h1>
          </div>

          <div className="highlight-card">
            <h3>💧 Dew Point</h3>
            <h1 id="dewPoint">24°C</h1>
          </div>

          <div className="highlight-card">
            <h3>🌬 Gust Speed</h3>
            <h1 id="gustSpeed">20 km/h</h1>
          </div>

          <div className="highlight-card">
            <h3>☀ UV Risk</h3>
            <h1 id="uvRisk">Moderate</h1>
          </div>
        </div>
      </section>

      {/* ================= WEATHER DETAILS ================= */}

      <section className="details">
        <div className="card">
          <h3>Humidity</h3>
          <p id="humidity">65%</p>
        </div>

        <div className="card">
          <h3>Wind</h3>
          <p id="wind">12 km/h</p>
        </div>

        <div className="card">
          <h3>Pressure</h3>
          <p id="pressure">1008 hPa</p>
        </div>

        <div className="card">
          <h3>Visibility</h3>
          <p id="visibility">10 km</p>
        </div>

        <div className="card">
          <h3>Clouds</h3>
          <p id="clouds">22%</p>
        </div>
      </section>

      {/* ================= AQI & UV ================= */}

      <section className="two-grid">
        <div className="glass">
          <h2>🌿 AQI</h2>
          <h1>52</h1>
          <p>Good</p>
        </div>

        <div className="glass">
          <h2>☀ UV Index</h2>
          <h1>6</h1>
          <p>Moderate</p>
        </div>
      </section>

      {/* ================= SUN ================= */}

      <section className="sun">
        <div className="glass">
          <h2>🌅 Sunrise</h2>
          <h1>5:42 AM</h1>
        </div>

        <div className="glass">
          <h2>🌇 Sunset</h2>
          <h1>6:58 PM</h1>
        </div>
      </section>

      {/* ================= HOURLY FORECAST ================= */}

      <section id="forecast">
        <h2 className="heading">Hourly Forecast</h2>

        <div className="hourly" id="hourlyForecast"></div>
      </section>

      {/* ================= WEEKLY FORECAST ================= */}

      <section className="weekly">
        <h2>Weekly Forecast</h2>

        <div className="week-grid" id="weeklyForecast"></div>
      </section>

      {/* ================= COMPARE CITIES ================= */}

      <section id="compare">
        <h2>Compare Cities</h2>

        <table id="compareTable"></table><br/><br/>

        <div className="compare-buttons">
          <button onClick={() => {
              if (window.addCity) window.addCity();
            }}
          >
            Add City
          </button>

          <button onClick={() => {
              if (window.removeCity) window.removeCity();
            }}
          >
            Remove Last City
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <h2 style={{ textDecoration: "underline" }}>HAWAMAAN</h2>

        <p>Weather Intelligence Dashboard</p>

        <p>Developed by <strong>Shlok Kuthe</strong></p>
        <p>USN NO : <strong>CS25D022</strong></p>

        <button className="feedback-trigger-btn"
          onClick={() => {
            if (window.toggleFeedbackModal)
              window.toggleFeedbackModal();
          }}
        >
          Feedback 💬
        </button>
      </footer>

      {/* ================= FEEDBACK MODAL ================= */}

      <div id="feedbackModal" className="modal">
        <div className="modal-content glass">
          <span className="close-btn"
            onClick={() => {
              if (window.toggleFeedbackModal)
                window.toggleFeedbackModal();
            }}
          >
            &times;
          </span>

          <h2>Submit Feedback</h2>

          <form id="feedbackForm"
            onSubmit={(e) => {
              if (window.submitFeedback) {
                window.submitFeedback(e);
              } else {
                e.preventDefault();
              }
            }}
          >
            <div className="form-group">
              <label htmlFor="fbName">Name</label>

              <input type="text" id="fbName" placeholder="Your Name" required/>
            </div>

            <div className="form-group">
              <label htmlFor="fbFeatures">
                What features should we add?
              </label>

              <textarea id="fbFeatures" rows="3"
                placeholder="Example: Weather Alerts, Interactive Maps..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="fbComment">
                General Suggestions
              </label>

              <textarea
                id="fbComment"
                rows="3"
                placeholder="Write your suggestions..."
              ></textarea>
            </div>

            <button type="submit">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./AuthModal.css";

export default function AuthModal({ closeModal }) {
  const { signup, login } = useApp();

  // Toggle between "login" and "signup" within ONE modal
  const [mode, setMode] = useState("login");

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");

  // Switch mode and clear all fields + messages
  const switchMode = (m) => {
    setMode(m);
    setError(""); setSuccess("");
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
  };

  const handleSubmit = () => {
    setError("");

    if (mode === "signup") {
      // ── Sign Up Validation ─────────────────
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      signup({ name, email, password });
      setSuccess("Account created! Welcome to Movies-Hub 🎬");
      setTimeout(closeModal, 900);

    } else {
      // ── Login Validation ───────────────────
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
      const saved = JSON.parse(localStorage.getItem("movieshub_user") || "null");
      if (!saved) {
        setError("No account found — please Sign Up first.");
        return;
      }
      if (saved.email !== email || saved.password !== password) {
        setError("Incorrect email or password.");
        return;
      }
      login(saved);
      setSuccess("Welcome back! 🎬");
      setTimeout(closeModal, 700);
    }
  };

  return (
    <div
      className="authOverlay"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="authModal">

        {/* Close */}
        <button className="authCloseBtn" onClick={closeModal} aria-label="Close">✕</button>

        {/* Header */}
        <div className="authHeader">
          <div className="authLogo">🎬</div>
          <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p>{mode === "login" ? "Sign in to your Movies-Hub account" : "Join for free — takes 30 seconds"}</p>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="authTabs">
          <button
            className={`authTab ${mode === "login"  ? "authTabActive" : ""}`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            className={`authTab ${mode === "signup" ? "authTabActive" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {error   && <div className="authAlert authAlertError">⚠️ {error}</div>}
        {success && <div className="authAlert authAlertSuccess">✅ {success}</div>}

        {/* Fields */}
        <div className="authForm">
          {mode === "signup" && (
            <div className="authField">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="authField">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="authField">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {mode === "signup" && (
            <div className="authField">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          <button className="authSubmitBtn" onClick={handleSubmit}>
            {mode === "login" ? "🔓 Sign In" : "🎬 Create Account"}
          </button>
        </div>

        {/* Switch hint */}
        <p className="authSwitchHint">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            className="authSwitchLink"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
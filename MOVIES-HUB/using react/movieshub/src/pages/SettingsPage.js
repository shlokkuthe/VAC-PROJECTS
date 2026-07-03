import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, updateUser, logout } = useApp();
  const navigate = useNavigate();

  const [name,   setName]   = useState(user?.name  || "");
  const [email,  setEmail]  = useState(user?.email || "");
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const handleSave = () => {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email cannot be empty.");
      return;
    }
    updateUser({ ...user, name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="settingsPage">
      <div className="pageHero">
        <h1>⚙️ Settings</h1>
        <p>Manage your account details and preferences</p>
      </div>

      <div className="settingsBody">

        {/* ── Account ── */}
        <section className="settingsSection">
          <h3 className="settingsHeading">Account Details</h3>

          <div className="settingsField">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="settingsField">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          {error && <p className="settingsError">⚠️ {error}</p>}
          {saved && <p className="settingsSaved">✅ Changes saved!</p>}

          <button className="settingsSaveBtn" onClick={handleSave}>Save Changes</button>
        </section>

        {/* ── Preferences ── */}
        <section className="settingsSection">
          <h3 className="settingsHeading">Preferences</h3>
          <div className="prefRow"><span>🌙 Dark Mode</span>  <div className="toggle on">ON</div></div>
          <div className="prefRow"><span>🔔 Notifications</span><div className="toggle off">OFF</div></div>
          <div className="prefRow"><span>🌍 Language</span>   <span className="prefVal">English</span></div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="settingsSection danger">
          <h3 className="settingsHeading red">Danger Zone</h3>
          <p className="dangerNote">Logging out ends your session. Your account and favorites are preserved.</p>
          <button className="settingsLogoutBtn" onClick={handleLogout}>🚪 Logout</button>
        </section>

      </div>
    </div>
  );
}

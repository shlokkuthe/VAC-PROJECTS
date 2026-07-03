import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, favorites } = useApp();
  const navigate = useNavigate();

  const joinDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="profilePage">
      {/* Banner */}
      <div className="profileBanner">
        <div className="profileAvatarXl">{user.name.charAt(0).toUpperCase()}</div>
        <h2 className="profileName">{user.name}</h2>
        <p className="profileEmail">{user.email}</p>
        <span className="profileBadge">🎬 Movies Enthusiast</span>
      </div>

      {/* Stats */}
      <div className="profileStats">
        <div className="statBox">
          <span className="statNum">{favorites.length}</span>
          <span className="statLabel">Favorites</span>
        </div>
        <div className="statBox">
          <span className="statNum">∞</span>
          <span className="statLabel">Movies</span>
        </div>
        <div className="statBox">
          <span className="statNum">Free</span>
          <span className="statLabel">Plan</span>
        </div>
      </div>

      {/* Info */}
      <div className="profileBody">
        <div className="infoCard">
          <h3>Account Details</h3>
          <div className="infoRow">
            <span>👤 Full Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="infoRow">
            <span>📧 Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="infoRow">
            <span>📅 Member Since</span>
            <strong>{joinDate}</strong>
          </div>
          <div className="infoRow">
            <span>🌍 Region</span>
            <strong>Global</strong>
          </div>
        </div>

        <div className="profileActions">
          <button className="profileActionBtn" onClick={() => navigate("/favorites")}>
            ❤️ View Favorites ({favorites.length})
          </button>
          <button className="profileActionBtn secondary" onClick={() => navigate("/settings")}>
            ⚙️ Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, favorites, recentlyViewed } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

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
          <span className="statNum">{recentlyViewed.length}</span>
          <span className="statLabel">Recently Viewed</span>
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

      {/* Recently Viewed Section */}
      <div className="profileRecentSection" style={{ width: "92%", margin: "40px auto 60px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "20px" }}>
          Recently Viewed Titles
        </h3>
        {recentlyViewed.length === 0 ? (
          <div className="emptyState" style={{ padding: "30px 20px" }}>
            <p style={{ color: "#777", fontSize: "14px" }}>You haven't viewed any movies recently.</p>
          </div>
        ) : (
          <div className="movieGrid">
            {recentlyViewed.map((m) => (
              <MovieCard key={m.imdbID} movie={m} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <MovieDetailsModal movie={selected} closeModal={() => setSelected(null)} />
      )}
    </div>
  );
}

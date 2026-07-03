import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AuthModal from "./AuthModal";
import FeedbackModal from "./FeedbackModal";
import "./Header.css";

export default function Header() {
  const { loggedIn, user, logout, favorites } = useApp();
  const navigate = useNavigate();

  const [showMenu,     setShowMenu]     = useState(false);
  const [showAuth,     setShowAuth]     = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  // Nav link helper — red underline when active
  const navClass = ({ isActive }) => isActive ? "navLink navActive" : "navLink";

  const goTo = (path) => {
    setShowMenu(false);
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/");
  };

  return (
    <>
      <header className="header">

        {/* ── Logo ── */}
        <NavLink to="/" className="headerLogo">
          🎬 <span>MOVIES-HUB</span>
        </NavLink>

        {/* ── Desktop Nav ── */}
        <nav className="navLinks">
          <NavLink to="/"       className={navClass} end>Home</NavLink>
          <NavLink to="/movies" className={navClass}>Movies</NavLink>
          <NavLink to="/series" className={navClass}>Series</NavLink>
        </nav>

        {/* ── Right Side ── */}
        <div className="headerRight">

          {/* Feedback button — always visible */}
          <button
            className="feedbackBtn"
            onClick={() => setShowFeedback(true)}
            title="Share feedback / suggest a movie"
          >
            💬 Feedback
          </button>

          {loggedIn ? (
            /* ── Profile Avatar + Dropdown ── */
            <div className="profileWrap">
              <button
                className="profileAvatar"
                onClick={() => setShowMenu(!showMenu)}
                title="Profile menu"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {showMenu && (
                <>
                  <div className="menuBackdrop" onClick={() => setShowMenu(false)} />
                  <div className="profileMenu">
                    {/* User info */}
                    <div className="menuUserInfo">
                      <div className="menuAvatarLg">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="menuName">{user.name}</p>
                        <p className="menuEmail">{user.email}</p>
                      </div>
                    </div>

                    <div className="menuDivider" />

                    <button className="menuItem" onClick={() => goTo("/profile")}>
                      👤 My Profile
                    </button>
                    <button className="menuItem" onClick={() => goTo("/favorites")}>
                      ❤️ Favorites
                      {favorites.length > 0 && (
                        <span className="menuBadge">{favorites.length}</span>
                      )}
                    </button>
                    <button className="menuItem" onClick={() => goTo("/settings")}>
                      ⚙️ Settings
                    </button>

                    <div className="menuDivider" />

                    <button className="menuItem menuLogout" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── Login / Sign Up button ── */
            <button className="authBtn" onClick={() => setShowAuth(true)}>
              Login / Sign Up
            </button>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

      </header>

      {/* ── Mobile Nav ── */}
      {mobileOpen && (
        <nav className="mobileNav">
          <NavLink to="/"       className={navClass} end onClick={() => setMobileOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/movies" className={navClass}     onClick={() => setMobileOpen(false)}>🎬 Movies</NavLink>
          <NavLink to="/series" className={navClass}     onClick={() => setMobileOpen(false)}>📺 Series</NavLink>
          {loggedIn && (
            <>
              <NavLink to="/profile"   className={navClass} onClick={() => setMobileOpen(false)}>👤 Profile</NavLink>
              <NavLink to="/favorites" className={navClass} onClick={() => setMobileOpen(false)}>❤️ Favorites</NavLink>
              <NavLink to="/settings"  className={navClass} onClick={() => setMobileOpen(false)}>⚙️ Settings</NavLink>
            </>
          )}
          <button className="feedbackBtn mobileOnly" onClick={() => { setMobileOpen(false); setShowFeedback(true); }}>💬 Feedback</button>
          {!loggedIn && <button className="authBtn mobileOnly" onClick={() => { setMobileOpen(false); setShowAuth(true); }}>Login / Sign Up</button>}
        </nav>
      )}

      {/* ── Modals ── */}
      {showAuth     && <AuthModal     closeModal={() => setShowAuth(false)} />}
      {showFeedback && <FeedbackModal closeModal={() => setShowFeedback(false)} />}
    </>
  );
}
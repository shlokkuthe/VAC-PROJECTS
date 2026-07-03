import { createContext, useContext, useState, useEffect } from "react";

// ── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Restore session from localStorage on first load
  useEffect(() => {
    const status    = localStorage.getItem("movieshub_loggedIn");
    const savedUser = JSON.parse(localStorage.getItem("movieshub_user") || "null");
    const savedFavs = JSON.parse(localStorage.getItem("movieshub_favorites") || "[]");
    if (status === "true" && savedUser) {
      setLoggedIn(true);
      setUser(savedUser);
      setFavorites(savedFavs);
    }
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────

  function signup(userData) {
    localStorage.setItem("movieshub_user",      JSON.stringify(userData));
    localStorage.setItem("movieshub_loggedIn",  "true");
    localStorage.setItem("movieshub_favorites", "[]");
    setLoggedIn(true);
    setUser(userData);
    setFavorites([]);
  }

  function login(userData) {
    const favs = JSON.parse(localStorage.getItem("movieshub_favorites") || "[]");
    localStorage.setItem("movieshub_loggedIn", "true");
    setLoggedIn(true);
    setUser(userData);
    setFavorites(favs);
  }

  function logout() {
    localStorage.removeItem("movieshub_loggedIn");
    setLoggedIn(false);
    setUser(null);
    // Keep saved user record & favorites so they survive re-login
  }

  function updateUser(updated) {
    localStorage.setItem("movieshub_user", JSON.stringify(updated));
    setUser(updated);
  }

  // ── Favorites ───────────────────────────────────────────────────────────

  function addFavorite(movie) {
    const updated = [...favorites, movie];
    setFavorites(updated);
    localStorage.setItem("movieshub_favorites", JSON.stringify(updated));
  }

  function removeFavorite(imdbID) {
    const updated = favorites.filter((f) => f.imdbID !== imdbID);
    setFavorites(updated);
    localStorage.setItem("movieshub_favorites", JSON.stringify(updated));
  }

  function isFavorite(imdbID) {
    return favorites.some((f) => f.imdbID === imdbID);
  }

  // ── Context Value ────────────────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        user, loggedIn, favorites,
        signup, login, logout, updateUser,
        addFavorite, removeFavorite, isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook — import this in every component ──────────────────────────────────
export function useApp() {
  return useContext(AppContext);
}

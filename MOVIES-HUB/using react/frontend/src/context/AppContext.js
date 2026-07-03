import { createContext, useContext, useState, useEffect } from "react";
import { authService, favoriteService, watchlistService, movieService } from "../api/apiService";

// ── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore session from JWT on first load
  useEffect(() => {
    const token = localStorage.getItem("movieshub_token");
    if (token) {
      authService.getProfile()
        .then(async (userData) => {
          setLoggedIn(true);
          setUser(userData);
          
          try {
            const [favs, watch, recent] = await Promise.all([
              favoriteService.fetchFavorites(),
              watchlistService.fetchWatchlist(),
              movieService.fetchRecentlyViewed()
            ]);
            setFavorites(favs);
            setWatchlist(watch);
            setRecentlyViewed(recent);
          } catch (err) {
            console.error("Failed to load user records from MongoDB:", err);
          }
        })
        .catch((err) => {
          console.error("Session verification failed:", err);
          logout();
        })
        .finally(() => {
          setLoadingSession(false);
        });
    } else {
      setLoadingSession(false);
    }
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────

  async function signup(name, email, password) {
    const res = await authService.signup(name, email, password);
    setLoggedIn(true);
    setUser({ _id: res._id, name: res.name, email: res.email });
    setFavorites([]);
    setWatchlist([]);
    setRecentlyViewed([]);
    return res;
  }

  async function login(email, password) {
    const res = await authService.login(email, password);
    setLoggedIn(true);
    setUser({ _id: res._id, name: res.name, email: res.email });
    
    // Load existing items
    const [favs, watch, recent] = await Promise.all([
      favoriteService.fetchFavorites(),
      watchlistService.fetchWatchlist(),
      movieService.fetchRecentlyViewed()
    ]);
    setFavorites(favs);
    setWatchlist(watch);
    setRecentlyViewed(recent);
    return res;
  }

  function logout() {
    authService.logout();
    setLoggedIn(false);
    setUser(null);
    setFavorites([]);
    setWatchlist([]);
    setRecentlyViewed([]);
  }

  async function updateUser(updated) {
    const res = await authService.updateProfile(updated.name, updated.email);
    setUser(prev => ({ ...prev, name: res.name, email: res.email }));
    return res;
  }

  // ── Favorites ───────────────────────────────────────────────────────────

  async function addFavorite(movie) {
    try {
      const saved = await favoriteService.addFavorite(movie);
      setFavorites(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Add favorite failed:", err);
    }
  }

  async function removeFavorite(imdbID) {
    try {
      await favoriteService.removeFavorite(imdbID);
      setFavorites(prev => prev.filter((f) => f.imdbID !== imdbID));
    } catch (err) {
      console.error("Remove favorite failed:", err);
    }
  }

  function isFavorite(imdbID) {
    return favorites.some((f) => f.imdbID === imdbID);
  }

  // ── Watchlist ───────────────────────────────────────────────────────────

  async function addWatchlist(movie) {
    try {
      const saved = await watchlistService.addWatchlist(movie);
      setWatchlist(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Add watchlist failed:", err);
    }
  }

  async function removeWatchlist(imdbID) {
    try {
      await watchlistService.removeWatchlist(imdbID);
      setWatchlist(prev => prev.filter((w) => w.imdbID !== imdbID));
    } catch (err) {
      console.error("Remove watchlist failed:", err);
    }
  }

  function isWatchlist(imdbID) {
    return watchlist.some((w) => w.imdbID === imdbID);
  }

  // ── Recently Viewed ─────────────────────────────────────────────────────

  async function logRecentlyViewed(movie) {
    if (!loggedIn) return;
    try {
      const list = await movieService.logRecentlyViewed(movie);
      setRecentlyViewed(list);
    } catch (err) {
      console.error("Failed to log recently viewed:", err);
    }
  }

  // ── Context Value ────────────────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        user, loggedIn, favorites, watchlist, recentlyViewed, loadingSession,
        signup, login, logout, updateUser,
        addFavorite, removeFavorite, isFavorite,
        addWatchlist, removeWatchlist, isWatchlist,
        logRecentlyViewed
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

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { movieService } from "../api/apiService";
import "./MovieDetailsModal.css";

const FALLBACK = "https://placehold.co/300x450/111/555?text=No+Poster";

export default function MovieDetailsModal({ movie, closeModal }) {
  const { 
    loggedIn, 
    isFavorite, addFavorite, removeFavorite, 
    isWatchlist, addWatchlist, removeWatchlist, 
    logRecentlyViewed 
  } = useApp();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (movie.Plot && movie.Plot !== "N/A" && movie.Director) {
        setDetails(movie);
        logRecentlyViewed(movie);
        return;
      }
      
      setLoading(true);
      try {
        const data = await movieService.fetchMovieDetails(movie.imdbID);
        const resolvedMovie = data || movie;
        setDetails(resolvedMovie);
        logRecentlyViewed(resolvedMovie);
      } catch (err) {
        console.error("Failed to load details:", err);
        setDetails(movie);
        logRecentlyViewed(movie);
      } finally {
        setLoading(false);
      }
    };

    if (movie) {
      fetchDetails();
    }
  }, [movie, logRecentlyViewed]);

  if (!movie) return null;

  const info = details || movie;
  const fav  = isFavorite(info.imdbID);
  const inWatchlist = isWatchlist(info.imdbID);

  const handleFav = () => {
    if (!loggedIn) { alert("Please login to save favorites!"); return; }
    fav ? removeFavorite(info.imdbID) : addFavorite(info);
  };

  const handleWatchlist = () => {
    if (!loggedIn) { alert("Please login to save your watchlist!"); return; }
    inWatchlist ? removeWatchlist(info.imdbID) : addWatchlist(info);
  };

  return (
    <div
      className="detailsOverlay"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="detailsModal">
        <button className="detailsCloseBtn" onClick={closeModal}>✕</button>

        {loading ? (
          <div className="detailsLoading">Loading details...</div>
        ) : (
          <div className="detailsContent">

            {/* ── Poster Column ── */}
            <div className="detailsPosterCol">
              <img
                src={info.Poster && info.Poster !== "N/A" ? info.Poster : FALLBACK}
                alt={info.Title}
              />
              <button
                className={`detailsFavBtn ${fav ? "detailsFavActive" : ""}`}
                onClick={handleFav}
                style={{ marginBottom: "8px" }}
              >
                {fav ? "❤️ Saved" : "🤍 Add to Favorites"}
              </button>
              <button
                className={`detailsWatchlistBtn ${inWatchlist ? "detailsWatchlistActive" : ""}`}
                onClick={handleWatchlist}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${inWatchlist ? "#e50914" : "#444"}`,
                  background: inWatchlist ? "rgba(229, 9, 20, 0.15)" : "#1c1c1c",
                  color: inWatchlist ? "#e50914" : "#aaa",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                {inWatchlist ? "➕ Saved to Watchlist" : "➕ Add to Watchlist"}
              </button>
            </div>

            {/* ── Info Column ── */}
            <div className="detailsInfoCol">
              <h1>{info.Title}</h1>

              <div className="detailsBadges">
                {info.imdbRating && info.imdbRating !== "N/A" && (
                  <span className="badge badgeRating">⭐ {info.imdbRating}</span>
                )}
                {info.Type && (
                  <span className="badge badgeType">
                    {info.Type === "series" ? "📺 Series" : "🎬 Movie"}
                  </span>
                )}
                {info.Year && <span className="badge">{info.Year}</span>}
                {info.Runtime && info.Runtime !== "N/A" && (
                  <span className="badge">⏱ {info.Runtime}</span>
                )}
              </div>

              <div className="detailsGrid">
                {info.Genre    && info.Genre    !== "N/A" && <div className="dItem"><span>Genre</span><p>{info.Genre}</p></div>}
                {info.Language && info.Language !== "N/A" && <div className="dItem"><span>Language</span><p>{info.Language}</p></div>}
                {info.Country  && info.Country  !== "N/A" && <div className="dItem"><span>Country</span><p>{info.Country}</p></div>}
                {info.Released && info.Released !== "N/A" && <div className="dItem"><span>Released</span><p>{info.Released}</p></div>}
              </div>

              {info.Director && info.Director !== "N/A" && (
                <div className="detailsSection"><h4>Director</h4><p>{info.Director}</p></div>
              )}
              {info.Actors && info.Actors !== "N/A" && (
                <div className="detailsSection"><h4>Cast</h4><p>{info.Actors}</p></div>
              )}
              {info.Plot && info.Plot !== "N/A" && (
                <div className="detailsSection"><h4>Plot</h4><p className="plotText">{info.Plot}</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
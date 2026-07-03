import { useState } from "react";
import { useApp } from "../context/AppContext";
import MovieDetailsModal from "../components/MovieDetailsModal";
import "./WatchlistPage.css";

const FALLBACK = "https://placehold.co/80x120/1a1a1a/555?text=?";

export default function WatchlistPage() {
  const { watchlist, removeWatchlist } = useApp();
  const [selected, setSelected] = useState(null);

  return (
    <div className="watchlistPage">
      <div className="pageHero">
        <h1>📋 My Watchlist</h1>
        <p>{watchlist.length} saved title{watchlist.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="watchlistBody">
        {watchlist.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">🎬</div>
            <h3>No items in Watchlist</h3>
            <p>Click the Watchlist button on any movie details popup to save it here.</p>
          </div>
        ) : (
          <div className="watchlistList">
            {watchlist.map((movie) => (
              <div
                className="watchlistRow"
                key={movie.imdbID}
                onClick={() => setSelected(movie)}
              >
                <img
                  src={movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK}
                  alt={movie.Title}
                  className="watchlistRowPoster"
                />
                <div className="watchlistRowInfo">
                  <h4>{movie.Title}</h4>
                  <p>📅 {movie.Year}</p>
                  <p>{movie.Type === "series" ? "📺 Series" : "🎬 Movie"}</p>
                  {movie.imdbRating && <p>⭐ {movie.imdbRating}</p>}
                </div>
                <button
                  className="watchlistRemoveBtn"
                  onClick={(e) => { e.stopPropagation(); removeWatchlist(movie.imdbID); }}
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
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

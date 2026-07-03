import { useState } from "react";
import { useApp } from "../context/AppContext";
import MovieDetailsModal from "../components/MovieDetailsModal";
import "./FavoritesPage.css";

const FALLBACK = "https://placehold.co/80x120/1a1a1a/555?text=?";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useApp();
  const [selected, setSelected] = useState(null);

  return (
    <div className="favPage">
      <div className="pageHero">
        <h1>❤️ My Favorites</h1>
        <p>{favorites.length} saved title{favorites.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="favBody">
        {favorites.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">🎬</div>
            <h3>No Favorites Yet</h3>
            <p>Click the ❤️ on any movie or series to save it here.</p>
          </div>
        ) : (
          <div className="favList">
            {favorites.map((movie) => (
              <div
                className="favRow"
                key={movie.imdbID}
                onClick={() => setSelected(movie)}
              >
                <img
                  src={movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK}
                  alt={movie.Title}
                  className="favRowPoster"
                />
                <div className="favRowInfo">
                  <h4>{movie.Title}</h4>
                  <p>📅 {movie.Year}</p>
                  <p>{movie.Type === "series" ? "📺 Series" : "🎬 Movie"}</p>
                  {movie.imdbRating && <p>⭐ {movie.imdbRating}</p>}
                </div>
                <button
                  className="favRemoveBtn"
                  onClick={(e) => { e.stopPropagation(); removeFavorite(movie.imdbID); }}
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

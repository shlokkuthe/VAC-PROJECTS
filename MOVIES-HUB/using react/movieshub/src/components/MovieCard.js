import { useApp } from "../context/AppContext";
import "./MovieCard.css";

const FALLBACK = "https://placehold.co/300x450/1a1a1a/555?text=No+Poster";

export default function MovieCard({ movie, onSelect }) {
  const { loggedIn, isFavorite, addFavorite, removeFavorite } = useApp();

  const fav = isFavorite(movie.imdbID);

  const handleFav = (e) => {
    e.stopPropagation();
    if (!loggedIn) {
      alert("Please login to save favorites!");
      return;
    }
    fav ? removeFavorite(movie.imdbID) : addFavorite(movie);
  };

  return (
    <div className="movieCard" onClick={() => onSelect(movie)}>

      {/* ── Poster ── */}
      <div className="cardPoster">
        <img
          src={movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK}
          alt={movie.Title}
          loading="lazy"
        />

        {/* Favorite heart */}
        <button
          className={`cardFavBtn ${fav ? "cardFavActive" : ""}`}
          onClick={handleFav}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          {fav ? "❤️" : "🤍"}
        </button>

        {/* Type badge */}
        <span className="cardTypeBadge">
          {movie.Type === "series" ? "📺 Series" : "🎬 Movie"}
        </span>
      </div>

      {/* ── Info ── */}
      <div className="cardInfo">
        <h3 className="cardTitle">{movie.Title}</h3>
        <p className="cardYear">📅 {movie.Year}</p>
        {movie.imdbRating && movie.imdbRating !== "N/A" && (
          <p className="cardRating">⭐ {movie.imdbRating}</p>
        )}
        <button className="cardDetailsBtn" onClick={(e) => { e.stopPropagation(); onSelect(movie); }}>
          View Details
        </button>
      </div>
    </div>
  );
}

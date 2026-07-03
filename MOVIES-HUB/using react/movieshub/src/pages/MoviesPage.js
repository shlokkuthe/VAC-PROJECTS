import { useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import Pagination from "../components/Pagination";
import { CATEGORY_DATA } from "../data/staticData";

const MOVIE_CATS = ["Hollywood", "Bollywood", "Tollywood", "Kollywood", "Mollywood"];
const PER_PAGE   = 12;

export default function MoviesPage() {
  const [cat,      setCat]      = useState("Hollywood");
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const movies  = (CATEGORY_DATA[cat] || []).filter(Boolean);
  const start   = (page - 1) * PER_PAGE;
  const visible = movies.slice(start, start + PER_PAGE);

  const handleCat = (name) => { setCat(name); setPage(1); };

  return (
    <div>
      {/* Page hero */}
      <div className="pageHero">
        <h1>🎬 Movies</h1>
        <p>Browse our curated collection of films from around the world</p>
      </div>

      {/* Category tabs — movies only */}
      <div style={{ width: "92%", margin: "32px auto 24px", display: "flex", flexWrap: "wrap", gap: 10 }}>
        {MOVIE_CATS.map((c) => (
          <button
            key={c}
            onClick={() => handleCat(c)}
            style={{
              padding: "9px 20px", borderRadius: 30,
              border: `1px solid ${cat === c ? "#e50914" : "#2a2a2a"}`,
              background: cat === c ? "#e50914" : "#161616",
              color: cat === c ? "#fff" : "#888",
              fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="sectionTitle"><h2>{cat} Movies</h2></div>

      {visible.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">🎬</div>
          <h3>No movies yet</h3>
          <p>This category is coming soon!</p>
        </div>
      ) : (
        <div className="movieGrid">
          {visible.map((m) => (
            <MovieCard key={m.imdbID} movie={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      <Pagination total={movies.length} perPage={PER_PAGE} current={page} onChange={setPage} />

      {selected && <MovieDetailsModal movie={selected} closeModal={() => setSelected(null)} />}
    </div>
  );
}

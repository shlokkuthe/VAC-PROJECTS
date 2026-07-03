import { useState } from "react";
import CategoryButtons from "../components/CategoryButtons";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import Pagination from "../components/Pagination";
import { CATEGORY_DATA, STATIC_MOVIES, STATIC_SERIES } from "../data/staticData";
import { searchMovies } from "../api/omdb";
import "./Home.css";

const PER_PAGE = 12;

export default function Home() {
  const [category,   setCategory]   = useState("Hollywood");
  const [movies,     setMovies]      = useState(() => (CATEGORY_DATA["Hollywood"] || []).filter(Boolean));
  const [searchText, setSearchText]  = useState("");
  const [searching,  setSearching]   = useState(false);
  const [searchLabel, setSearchLabel] = useState("");
  const [loading,    setLoading]     = useState(false);
  const [page,       setPage]        = useState(1);
  const [selected,   setSelected]    = useState(null);

  // ── Category change ──────────────────────────────────────────────────────
  const handleCategory = (name) => {
    setCategory(name);
    setSearching(false);
    setSearchLabel("");
    setPage(1);
    setMovies((CATEGORY_DATA[name] || []).filter(Boolean));
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = searchText.trim();
    if (!q) return;

    setSearching(true);
    setSearchLabel(q);
    setPage(1);

    // 1. Search local static data first
    const localHits = [...STATIC_MOVIES, ...STATIC_SERIES].filter(
      (m) =>
        m.Title.toLowerCase().includes(q.toLowerCase()) ||
        (m.Genre   && m.Genre.toLowerCase().includes(q.toLowerCase())) ||
        (m.Actors  && m.Actors.toLowerCase().includes(q.toLowerCase()))
    );

    if (localHits.length > 0) {
      setMovies(localHits);
      return;
    }

    // 2. Fallback: OMDB API
    setLoading(true);
    const results = await searchMovies(q);
    setMovies(results || []);
    setLoading(false);
  };

  // ── Pagination slice ─────────────────────────────────────────────────────
  const start   = (page - 1) * PER_PAGE;
  const visible = movies.slice(start, start + PER_PAGE);

  return (
    <div className="homePage">

      {/* Hero */}
      <section className="homeHero">
        <div className="homeHeroContent">
          <h1>MOVIES-HUB</h1>
          <p>Discover movies, series &amp; entertainment from around the world</p>
        </div>
      </section>

      {/* Filter + Search */}
      <div className="homeControls">
        <CategoryButtons active={category} onChange={handleCategory} />
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onSearch={handleSearch}
        />
      </div>

      {/* Section title */}
      <div className="sectionTitle">
        <h2>
          {searching
            ? `Results for "${searchLabel}"`
            : `${category}${category === "Series" || category === "All" ? "" : " Movies"}`}
        </h2>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="loadingState">🔍 Searching...</p>
      ) : visible.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">🎬</div>
          <h3>No results found</h3>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="movieGrid">
          {visible.map((m) => (
            <MovieCard key={m.imdbID} movie={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      <Pagination
        total={movies.length}
        perPage={PER_PAGE}
        current={page}
        onChange={setPage}
      />

      {selected && (
        <MovieDetailsModal movie={selected} closeModal={() => setSelected(null)} />
      )}
    </div>
  );
}

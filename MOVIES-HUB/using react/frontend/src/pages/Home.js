import { useState, useEffect } from "react";
import CategoryButtons from "../components/CategoryButtons";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import Pagination from "../components/Pagination";
import { movieService } from "../api/apiService";
import "./Home.css";

const PER_PAGE = 12;

export default function Home() {
  const [category,   setCategory]   = useState("Hollywood");
  const [movies,     setMovies]      = useState([]);
  const [searchText, setSearchText]  = useState("");
  const [searching,  setSearching]   = useState(false);
  const [searchLabel, setSearchLabel] = useState("");
  const [loading,    setLoading]     = useState(false);
  const [page,       setPage]        = useState(1);
  const [selected,   setSelected]    = useState(null);

  // ── Category load on change ──────────────────────────────────────────────
  useEffect(() => {
    if (!searching) {
      const loadCategory = async () => {
        setLoading(true);
        try {
          const res = await movieService.fetchCategoryMovies(category);
          setMovies(res || []);
        } catch (err) {
          console.error("Error loading category:", err);
          setMovies([]);
        } finally {
          setLoading(false);
        }
      };
      loadCategory();
    }
  }, [category, searching]);

  // ── Category change ──────────────────────────────────────────────────────
  const handleCategory = (name) => {
    setCategory(name);
    setSearching(false);
    setSearchLabel("");
    setPage(1);
    setMovies([]);
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const q = searchText.trim();
    if (!q) return;

    setSearching(true);
    setSearchLabel(q);
    setPage(1);

    setLoading(true);
    try {
      const results = await movieService.searchMovies(q);
      setMovies(results || []);
    } catch (err) {
      console.error("Search error:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
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

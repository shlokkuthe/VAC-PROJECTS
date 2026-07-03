import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import Pagination from "../components/Pagination";
import { movieService } from "../api/apiService";

const PER_PAGE = 12;

export default function SeriesPage() {
  const [series,   setSeries]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        const res = await movieService.fetchCategoryMovies("Series");
        setSeries(res || []);
      } catch (err) {
        console.error("Error loading series:", err);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };
    loadSeries();
  }, []);

  const start   = (page - 1) * PER_PAGE;
  const visible = series.slice(start, start + PER_PAGE);

  return (
    <div>
      <div className="pageHero">
        <h1>📺 Series</h1>
        <p>Binge-worthy shows from around the world — handpicked for you</p>
      </div>

      <div className="sectionTitle" style={{ marginTop: 36 }}>
        <h2>Popular Series</h2>
      </div>

      {loading ? (
        <p className="loadingState">🔍 Loading series...</p>
      ) : visible.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">📺</div>
          <h3>No series yet</h3>
          <p>Coming soon!</p>
        </div>
      ) : (
        <div className="movieGrid">
          {visible.map((m) => (
            <MovieCard key={m.imdbID} movie={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      <Pagination
        total={series.length}
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

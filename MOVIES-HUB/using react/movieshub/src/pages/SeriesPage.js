import { useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import Pagination from "../components/Pagination";
import { STATIC_SERIES } from "../data/staticData";

const PER_PAGE = 12;

export default function SeriesPage() {
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const start   = (page - 1) * PER_PAGE;
  const visible = STATIC_SERIES.slice(start, start + PER_PAGE);

  return (
    <div>
      <div className="pageHero">
        <h1>📺 Series</h1>
        <p>Binge-worthy shows from around the world — handpicked for you</p>
      </div>

      <div className="sectionTitle" style={{ marginTop: 36 }}>
        <h2>Popular Series</h2>
      </div>

      {visible.length === 0 ? (
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
        total={STATIC_SERIES.length}
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

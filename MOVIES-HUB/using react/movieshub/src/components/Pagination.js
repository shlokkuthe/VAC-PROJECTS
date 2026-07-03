import "./Pagination.css";

export default function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        className="pageBtn"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ← Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`pageBtn ${current === p ? "pageBtnActive" : ""}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pageBtn"
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
      >
        Next →
      </button>
    </div>
  );
}
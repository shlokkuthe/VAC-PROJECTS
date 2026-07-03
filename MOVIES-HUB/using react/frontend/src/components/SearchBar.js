import "./SearchBar.css";

export default function SearchBar({ searchText, setSearchText, onSearch }) {
  return (
    <div className="searchBarWrap">
      <div className="searchBox">
        <span className="searchIcon">🔍</span>
        <input
          type="text"
          placeholder="Search movies, series, actors..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        {searchText && (
          <button className="searchClear" onClick={() => setSearchText("")}>✕</button>
        )}
      </div>
      <button className="searchBtn" onClick={onSearch}>Search</button>
    </div>
  );
}
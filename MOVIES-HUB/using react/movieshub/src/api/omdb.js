const API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const BASE_URL = "https://www.omdbapi.com/";

/**
 * Search movies/series by title keyword.
 * @param {string} query  - Search term
 * @param {"movie"|"series"|""} type - Optional type filter
 */
export async function searchMovies(query, type = "") {
  if (!query?.trim()) return [];
  try {
    const typeParam = type ? `&type=${type}` : "";
    const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query.trim())}${typeParam}`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.Response === "True" ? data.Search : [];
  } catch (err) {
    console.error("OMDB search error:", err);
    return [];
  }
}

/**
 * Fetch full details of a single movie/series by IMDb ID.
 * Returns the full object including Plot, Director, Actors, Poster, etc.
 */
export async function getMovieDetails(imdbID) {
  if (!imdbID) return null;
  try {
    const url  = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (err) {
    console.error("OMDB details error:", err);
    return null;
  }
}
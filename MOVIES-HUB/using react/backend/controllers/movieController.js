const MovieCache = require('../models/MovieCache');
const CategoryMovie = require('../models/CategoryMovie');
const RecentlyViewed = require('../models/RecentlyViewed');

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_URL = 'https://www.omdbapi.com/';

// Helper: fetch details from OMDB and cache it
const fetchAndCacheFromOMDB = async (imdbID) => {
  if (!imdbID || !OMDB_API_KEY) return null;
  try {
    const url = `${OMDB_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === 'True') {
      const cached = await MovieCache.findOneAndUpdate(
        { imdbID: data.imdbID },
        {
          imdbID: data.imdbID, Title: data.Title, Year: data.Year,
          Type: data.Type, Poster: data.Poster, Genre: data.Genre,
          imdbRating: data.imdbRating, Director: data.Director,
          Actors: data.Actors, Plot: data.Plot, Runtime: data.Runtime,
          Language: data.Language, Country: data.Country, Released: data.Released,
          cachedAt: new Date()
        },
        { upsert: true, new: true }
      );
      return cached;
    }
    return null;
  } catch (error) {
    console.error(`OMDB fetch error for ${imdbID}:`, error.message);
    return null;
  }
};

// Helper: get full movie details (cache-first, then OMDB)
const getMovieDetailsHelper = async (imdbID) => {
  if (!imdbID) return null;

  // 1. Check MongoDB cache first
  const cachedMovie = await MovieCache.findOne({ imdbID });
  if (cachedMovie) return cachedMovie;

  // 2. If not cached, try OMDB
  return await fetchAndCacheFromOMDB(imdbID);
};

// @desc    Get movies by category
// @route   GET /api/movies/category/:category
// @access  Public
const getCategoryMovies = async (req, res) => {
  const category = req.params.category;
  try {
    let mappings;
    if (category.toLowerCase() === 'all') {
      mappings = await CategoryMovie.find({});
    } else {
      mappings = await CategoryMovie.find({ category });
    }

    if (!mappings || mappings.length === 0) {
      return res.status(200).json([]);
    }

    const moviePromises = mappings.map((m) => getMovieDetailsHelper(m.imdbID));
    const resolvedMovies = await Promise.all(moviePromises);
    const movies = resolvedMovies.filter(Boolean);

    return res.status(200).json(movies);
  } catch (error) {
    console.error(`Category error for ${category}:`, error.message);
    return res.status(500).json({ message: 'Error fetching category movies' });
  }
};

// @desc    Proxy search to OMDB — with MongoDB cache fallback
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res) => {
  const { q, type } = req.query;
  if (!q || !q.trim()) return res.status(200).json([]);

  try {
    // 1. Try OMDB search (only if API key exists)
    if (OMDB_API_KEY) {
      const typeParam = type ? `&type=${type}` : '';
      const url = `${OMDB_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q.trim())}${typeParam}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        return res.status(200).json(data.Search);
      }
    }

    // 2. Fallback: search our MongoDB cache
    const regex = new RegExp(q.trim(), 'i');
    const cached = await MovieCache.find({
      $or: [
        { Title: regex },
        { Genre: regex },
        { Actors: regex },
        { Director: regex }
      ]
    }).limit(20);

    return res.status(200).json(cached);
  } catch (error) {
    console.error('Search error:', error.message);
    // Even on error, try the MongoDB fallback
    try {
      const regex = new RegExp(q.trim(), 'i');
      const cached = await MovieCache.find({
        $or: [{ Title: regex }, { Genre: regex }, { Actors: regex }]
      }).limit(20);
      return res.status(200).json(cached);
    } catch (dbErr) {
      return res.status(500).json({ message: 'Error searching movies' });
    }
  }
};

// @desc    Get full movie details
// @route   GET /api/movies/details/:imdbID
// @access  Public
const getMovieDetails = async (req, res) => {
  try {
    const details = await getMovieDetailsHelper(req.params.imdbID);
    if (!details) {
      return res.status(404).json({ message: 'Movie details not found' });
    }
    return res.status(200).json(details);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching movie details' });
  }
};

// @desc    Get user's recently viewed list
// @route   GET /api/movies/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const list = await RecentlyViewed.find({ user: req.user.id })
      .sort({ viewedAt: -1 })
      .limit(10);
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Log recently viewed movie
// @route   POST /api/movies/recently-viewed
// @access  Private
const addRecentlyViewed = async (req, res) => {
  const { imdbID, Title, Year, Type, Poster, imdbRating } = req.body;
  try {
    if (!imdbID || !Title) {
      return res.status(400).json({ message: 'Movie ID and Title are required' });
    }

    await RecentlyViewed.findOneAndUpdate(
      { user: req.user.id, imdbID },
      { Title, Year, Type, Poster, imdbRating: imdbRating || 'N/A', viewedAt: new Date() },
      { upsert: true, new: true }
    );

    // Keep only most recent 10
    const count = await RecentlyViewed.countDocuments({ user: req.user.id });
    if (count > 10) {
      const oldest = await RecentlyViewed.find({ user: req.user.id })
        .sort({ viewedAt: 1 })
        .limit(count - 10);
      await RecentlyViewed.deleteMany({ _id: { $in: oldest.map(o => o._id) } });
    }

    const updatedList = await RecentlyViewed.find({ user: req.user.id }).sort({ viewedAt: -1 });
    return res.status(200).json(updatedList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchMovies,
  getMovieDetails,
  getCategoryMovies,
  getRecentlyViewed,
  addRecentlyViewed
};

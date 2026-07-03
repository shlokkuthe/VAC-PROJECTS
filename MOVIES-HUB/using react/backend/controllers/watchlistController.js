const Watchlist = require('../models/Watchlist');

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(watchlist);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
const addWatchlist = async (req, res) => {
  const { imdbID, Title, Year, Type, Poster, imdbRating } = req.body;

  try {
    if (!imdbID || !Title) {
      return res.status(400).json({ message: 'Movie ID and Title are required' });
    }

    // Check if already in watchlist
    const isWatch = await Watchlist.findOne({ user: req.user.id, imdbID });
    if (isWatch) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    const watchlist = await Watchlist.create({
      user: req.user.id,
      imdbID,
      Title,
      Year,
      Type,
      Poster,
      imdbRating
    });

    return res.status(201).json(watchlist);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:imdbID
// @access  Private
const removeWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOneAndDelete({
      user: req.user.id,
      imdbID: req.params.imdbID
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    return res.status(200).json({ imdbID: req.params.imdbID, message: 'Removed from watchlist' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWatchlist,
  addWatchlist,
  removeWatchlist
};

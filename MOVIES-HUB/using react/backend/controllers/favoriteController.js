const Favorite = require('../models/Favorite');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(favorites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add movie to favorites
// @route   POST /api/favorites
// @access  Private
const addFavorite = async (req, res) => {
  const { imdbID, Title, Year, Type, Poster, imdbRating } = req.body;

  try {
    if (!imdbID || !Title) {
      return res.status(400).json({ message: 'Movie ID and Title are required' });
    }

    // Check if already in favorites
    const isFav = await Favorite.findOne({ user: req.user.id, imdbID });
    if (isFav) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      imdbID,
      Title,
      Year,
      Type,
      Poster,
      imdbRating
    });

    return res.status(201).json(favorite);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:imdbID
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      imdbID: req.params.imdbID
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    return res.status(200).json({ imdbID: req.params.imdbID, message: 'Removed from favorites' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};

const express = require('express');
const router = express.Router();
const { searchMovies, getMovieDetails, getCategoryMovies, getRecentlyViewed, addRecentlyViewed } = require('../controllers/movieController');
const { protect } = require('../middleware/auth');

router.get('/search', searchMovies);
router.get('/details/:imdbID', getMovieDetails);
router.get('/category/:category', getCategoryMovies);

// Recently viewed is user-specific and requires protection
router.route('/recently-viewed')
  .get(protect, getRecentlyViewed)
  .post(protect, addRecentlyViewed);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getWatchlist, addWatchlist, removeWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all routes in this file

router.route('/')
  .get(getWatchlist)
  .post(addWatchlist);

router.route('/:imdbID')
  .delete(removeWatchlist);

module.exports = router;

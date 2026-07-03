const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all routes in this file

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:imdbID')
  .delete(removeFavorite);

module.exports = router;

const mongoose = require('mongoose');

const movieCacheSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true
  },
  Title: {
    type: String,
    required: true
  },
  Year: String,
  Type: String,
  Poster: String,
  Genre: String,
  imdbRating: String,
  Director: String,
  Actors: String,
  Plot: String,
  Runtime: String,
  Language: String,
  Country: String,
  Released: String,
  cachedAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Cache expires after 7 days
  }
});

module.exports = mongoose.model('MovieCache', movieCacheSchema);

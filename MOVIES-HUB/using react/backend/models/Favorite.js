const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imdbID: {
    type: String,
    required: true
  },
  Title: {
    type: String,
    required: true
  },
  Year: String,
  Type: String,
  Poster: String,
  imdbRating: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A user can favorite a specific movie only once
favoriteSchema.index({ user: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

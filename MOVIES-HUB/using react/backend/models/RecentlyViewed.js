const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
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
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique user + imdbID index to easily upsert/update viewedAt
recentlyViewedSchema.index({ user: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);

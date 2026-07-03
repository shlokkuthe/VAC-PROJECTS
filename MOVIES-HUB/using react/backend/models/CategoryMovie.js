const mongoose = require('mongoose');

const categoryMovieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Hollywood', 'Bollywood', 'Tollywood', 'Kollywood', 'Mollywood', 'Series']
  }
});

// Unique index to prevent duplicating categories mappings
categoryMovieSchema.index({ imdbID: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('CategoryMovie', categoryMovieSchema);

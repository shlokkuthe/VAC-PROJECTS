const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper for sending fetch requests with JWT token automatically attached
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('movieshub_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API Calls
export const authService = {
  async signup(name, email, password) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data.token) {
      localStorage.setItem('movieshub_token', data.token);
    }
    return data;
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('movieshub_token', data.token);
    }
    return data;
  },

  async getProfile() {
    return request('/auth/me');
  },

  async updateProfile(name, email) {
    return request('/auth/update', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });
  },

  logout() {
    localStorage.removeItem('movieshub_token');
  }
};

// Movies API Calls
export const movieService = {
  async fetchCategoryMovies(category) {
    return request(`/movies/category/${category}`);
  },

  async searchMovies(query, type = '') {
    return request(`/movies/search?q=${encodeURIComponent(query)}&type=${type}`);
  },

  async fetchMovieDetails(imdbID) {
    return request(`/movies/details/${imdbID}`);
  },

  async fetchRecentlyViewed() {
    return request('/movies/recently-viewed');
  },

  async logRecentlyViewed(movie) {
    return request('/movies/recently-viewed', {
      method: 'POST',
      body: JSON.stringify(movie)
    });
  }
};

// Favorites API Calls
export const favoriteService = {
  async fetchFavorites() {
    return request('/favorites');
  },

  async addFavorite(movie) {
    return request('/favorites', {
      method: 'POST',
      body: JSON.stringify({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster,
        imdbRating: movie.imdbRating
      })
    });
  },

  async removeFavorite(imdbID) {
    return request(`/favorites/${imdbID}`, {
      method: 'DELETE'
    });
  }
};

// Watchlist API Calls
export const watchlistService = {
  async fetchWatchlist() {
    return request('/watchlist');
  },

  async addWatchlist(movie) {
    return request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Type: movie.Type,
        Poster: movie.Poster,
        imdbRating: movie.imdbRating
      })
    });
  },

  async removeWatchlist(imdbID) {
    return request(`/watchlist/${imdbID}`, {
      method: 'DELETE'
    });
  }
};

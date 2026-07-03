const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ─── Full movie data to seed into MongoDB ────────────────────────────────────
const FULL_MOVIE_DATA = [
  {
    imdbID: 'tt0848228', Title: 'The Avengers', Year: '2012', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNDYxNjQyMjAtNTdiOS00NGYwLWFmNTAtNThmYjU5ZGM2NTFlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
    Genre: 'Action, Adventure, Sci-Fi', imdbRating: '8.0', Director: 'Joss Whedon',
    Actors: 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
    Plot: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
    Runtime: '143 min', Language: 'English', Country: 'United States', Released: '04 May 2012'
  },
  {
    imdbID: 'tt4154796', Title: 'Avengers: Endgame', Year: '2019', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg',
    Genre: 'Action, Adventure, Drama', imdbRating: '8.4', Director: 'Anthony Russo, Joe Russo',
    Actors: 'Robert Downey Jr., Chris Evans, Mark Ruffalo',
    Plot: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions and restore balance to the universe.',
    Runtime: '181 min', Language: 'English', Country: 'United States', Released: '26 Apr 2019'
  },
  {
    imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    Genre: 'Action, Adventure, Sci-Fi', imdbRating: '8.8', Director: 'Christopher Nolan',
    Actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
    Plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    Runtime: '148 min', Language: 'English', Country: 'United States, United Kingdom', Released: '16 Jul 2010'
  },
  {
    imdbID: 'tt0468569', Title: 'The Dark Knight', Year: '2008', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    Genre: 'Action, Crime, Drama', imdbRating: '9.0', Director: 'Christopher Nolan',
    Actors: 'Christian Bale, Heath Ledger, Aaron Eckhart',
    Plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    Runtime: '152 min', Language: 'English', Country: 'United States, United Kingdom', Released: '18 Jul 2008'
  },
  {
    imdbID: 'tt0110912', Title: 'Pulp Fiction', Year: '1994', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    Genre: 'Crime, Drama', imdbRating: '8.9', Director: 'Quentin Tarantino',
    Actors: 'John Travolta, Uma Thurman, Samuel L. Jackson',
    Plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    Runtime: '154 min', Language: 'English, Spanish, French', Country: 'United States', Released: '14 Oct 1994'
  },
  {
    imdbID: 'tt0137523', Title: 'Fight Club', Year: '1999', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg',
    Genre: 'Drama', imdbRating: '8.8', Director: 'David Fincher',
    Actors: 'Brad Pitt, Edward Norton, Meat Loaf',
    Plot: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    Runtime: '139 min', Language: 'English', Country: 'Germany, United States', Released: '15 Oct 1999'
  },
  {
    imdbID: 'tt6751668', Title: 'Parasite', Year: '2019', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
    Genre: 'Comedy, Drama, Thriller', imdbRating: '8.5', Director: 'Bong Joon Ho',
    Actors: 'Kang-ho Song, Sun-kyun Lee, Yeo-jeong Jo',
    Plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    Runtime: '132 min', Language: 'Korean', Country: 'South Korea', Released: '08 Nov 2019'
  },
  {
    imdbID: 'tt0816692', Title: 'Interstellar', Year: '2014', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
    Genre: 'Adventure, Drama, Sci-Fi', imdbRating: '8.7', Director: 'Christopher Nolan',
    Actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    Plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    Runtime: '169 min', Language: 'English', Country: 'United States, United Kingdom, Canada', Released: '07 Nov 2014'
  },
  // Bollywood
  {
    imdbID: 'tt12844910', Title: 'Pathaan', Year: '2023', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNjRmOTM4MTMtMGNhZS00NDJlLThhNGQtZjZlNzRhYzQ4ZjNhXkEyXkFqcGdeQXVyMTUzNTgzNzM@._V1_SX300.jpg',
    Genre: 'Action, Thriller', imdbRating: '5.9', Director: 'Siddharth Anand',
    Actors: 'Shah Rukh Khan, Deepika Padukone, John Abraham',
    Plot: 'Pathaan, an exiled RAW agent, is brought back to work with a secret division of agents to stop a mercenary planning a large-scale attack on India.',
    Runtime: '146 min', Language: 'Hindi', Country: 'India', Released: '25 Jan 2023'
  },
  {
    imdbID: 'tt10838180', Title: 'KGF: Chapter 2', Year: '2022', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMTkwMTk1MzY4NF5BMl5BanBnXkFtZTgwNzYxMTMwNzE@._V1_SX300.jpg',
    Genre: 'Action, Crime, Drama', imdbRating: '8.2', Director: 'Prashanth Neel',
    Actors: 'Yash, Sanjay Dutt, Raveena Tandon',
    Plot: "Rocky's bloodstained rise to power continues as he expands his empire and faces threats from Inayat Khalil and the government of India.",
    Runtime: '168 min', Language: 'Kannada, Hindi', Country: 'India', Released: '14 Apr 2022'
  },
  // Tollywood
  {
    imdbID: 'tt8108198', Title: 'RRR', Year: '2022', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5ZjBmNTMzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg',
    Genre: 'Action, Drama', imdbRating: '7.8', Director: 'S.S. Rajamouli',
    Actors: 'N.T. Rama Rao Jr., Ram Charan, Ajay Devgn',
    Plot: 'A fictional story about two legendary revolutionaries and their journey far away from home.',
    Runtime: '187 min', Language: 'Telugu, Tamil, Hindi', Country: 'India', Released: '25 Mar 2022'
  },
  {
    imdbID: 'tt9052864', Title: 'Baahubali 2: The Conclusion', Year: '2017', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNzc0MzE5MDc1OF5BMl5BanBnXkFtZTgwNDUwNzg2MTI@._V1_SX300.jpg',
    Genre: 'Action, Drama', imdbRating: '8.2', Director: 'S.S. Rajamouli',
    Actors: 'Prabhas, Rana Daggubati, Anushka Shetty',
    Plot: 'When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom.',
    Runtime: '167 min', Language: 'Telugu, Tamil, Hindi, Malayalam', Country: 'India', Released: '28 Apr 2017'
  },
  // Kollywood
  {
    imdbID: 'tt13186482', Title: 'Vikram', Year: '2022', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNDEyMWQ0ZDktNTY0MC00YWRkLWFlMjQtMDUxMjRlMDhmMmRlXkEyXkFqcGc@._V1_.jpg',
    Genre: 'Action, Thriller', imdbRating: '7.9', Director: 'Lokesh Kanagaraj',
    Actors: 'Kamal Haasan, Vijay Sethupathi, Fahadh Faasil',
    Plot: 'A retired special agent comes back to action to hunt down a group of masked criminals.',
    Runtime: '174 min', Language: 'Tamil', Country: 'India', Released: '03 Jun 2022'
  },
  {
    imdbID: 'tt15078374', Title: 'Leo', Year: '2023', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNWVkZGY4ZTgtMzZkMS00OGEzLTliNTMtNzc3ZWUzNWI5OTQ2XkEyXkFqcGdeQXVyMTUzNTgzNzM@._V1_SX300.jpg',
    Genre: 'Action, Crime, Thriller', imdbRating: '7.2', Director: 'Lokesh Kanagaraj',
    Actors: 'Vijay, Trisha Krishnan, Sanjay Dutt',
    Plot: 'A mild-mannered coffee shop owner is forced to reveal his violent past when gangsters threaten his family.',
    Runtime: '164 min', Language: 'Tamil, Telugu, Hindi', Country: 'India', Released: '19 Oct 2023'
  },
  // Mollywood
  {
    imdbID: 'tt9476812', Title: '2018', Year: '2023', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYWI4ZjNhNzctYTE5MS00YmNmLTlhNTQtNzU3ZTc2MWU5YTlhXkEyXkFqcGdeQXVyMTUzNTgzNzM@._V1_SX300.jpg',
    Genre: 'Drama', imdbRating: '8.6', Director: 'Jude Anthany Joseph',
    Actors: 'Tovino Thomas, Kunchacko Boban, Asif Ali',
    Plot: 'Based on the real Kerala floods of 2018 and the heroic rescue efforts of ordinary people.',
    Runtime: '167 min', Language: 'Malayalam', Country: 'India', Released: '05 May 2023'
  },
  {
    imdbID: 'tt11731770', Title: 'Lucifer', Year: '2019', Type: 'movie',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMTQxNTkwMzQtNWVkNi00NTgzLTk0YjAtMDJjMzQ4ZjY2NWIxXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg',
    Genre: 'Action, Drama, Thriller', imdbRating: '7.5', Director: 'Prithviraj Sukumaran',
    Actors: 'Mohanlal, Manju Warrier, Vivek Oberoi',
    Plot: "After the death of Kerala's Chief Minister, a political battle ensues, exposing the mysterious past of a rising leader.",
    Runtime: '157 min', Language: 'Malayalam', Country: 'India', Released: '28 Mar 2019'
  },
  // Series
  {
    imdbID: 'tt5491994', Title: 'Planet Earth II', Year: '2016', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BMzY4NDBkMWYtYzdkYy00YzBjLWJmODctMWM4YjYzZTdjNWE5XkEyXkFqcGc@._V1_.jpg',
    Genre: 'Documentary', imdbRating: '9.5', Director: 'N/A',
    Actors: 'David Attenborough',
    Plot: 'David Attenborough presents a documentary series exploring how animals meet the challenges of surviving in the most iconic habitats on earth.',
    Runtime: '60 min', Language: 'English', Country: 'United Kingdom', Released: '06 Nov 2016'
  },
  {
    imdbID: 'tt0903747', Title: 'Breaking Bad', Year: '2008–2013', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc1NjA3OTk4MDQ3XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg',
    Genre: 'Crime, Drama, Thriller', imdbRating: '9.5', Director: 'Vince Gilligan',
    Actors: 'Bryan Cranston, Aaron Paul, Anna Gunn',
    Plot: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family\'s future.',
    Runtime: '49 min', Language: 'English, Spanish', Country: 'United States', Released: '20 Jan 2008'
  },
  {
    imdbID: 'tt4574334', Title: 'Stranger Things', Year: '2016–', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg',
    Genre: 'Drama, Fantasy, Horror', imdbRating: '8.7', Director: 'The Duffer Brothers',
    Actors: 'Millie Bobby Brown, Finn Wolfhard, Winona Ryder',
    Plot: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.',
    Runtime: '51 min', Language: 'English', Country: 'United States', Released: '15 Jul 2016'
  },
  {
    imdbID: 'tt7366338', Title: 'Dark', Year: '2017–2020', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BOTkzOTYwNTItZWZiZC00MDdhLWI3NTMtYTRiMzA3ZjQ3MzA0XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
    Genre: 'Crime, Drama, Mystery', imdbRating: '8.8', Director: 'Baran bo Odar',
    Actors: 'Louis Hofmann, Karoline Eichhorn, Lisa Vicari',
    Plot: 'A family saga with a supernatural twist, set in a German town, where the disappearance of two young children exposes the double lives and fractured relationships among four families.',
    Runtime: '60 min', Language: 'German', Country: 'Germany', Released: '01 Dec 2017'
  },
  {
    imdbID: 'tt0108778', Title: 'Friends', Year: '1994–2004', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NjkxLTgwZTEtYzYwZjY3M2EwZjJiXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg',
    Genre: 'Comedy, Romance', imdbRating: '8.9', Director: 'David Crane',
    Actors: 'Jennifer Aniston, Courteney Cox, Lisa Kudrow, Matt LeBlanc',
    Plot: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan, New York City.',
    Runtime: '22 min', Language: 'English', Country: 'United States', Released: '22 Sep 1994'
  },
  {
    imdbID: 'tt0944947', Title: 'Game of Thrones', Year: '2011–2019', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg',
    Genre: 'Action, Adventure, Drama', imdbRating: '9.2', Director: 'David Benioff',
    Actors: 'Emilia Clarke, Peter Dinklage, Kit Harington',
    Plot: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    Runtime: '57 min', Language: 'English', Country: 'United States, United Kingdom', Released: '17 Apr 2011'
  },
  {
    imdbID: 'tt5180504', Title: 'The Witcher', Year: '2019–', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BN2FiOWU4YzYtMzZiOS00MzcyLTlkOGQtZjliNmMyZjI4Y2IyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
    Genre: 'Action, Adventure, Drama', imdbRating: '8.0', Director: 'Lauren Schmidt Hissrich',
    Actors: 'Henry Cavill, Freya Allan, Anya Chalotra',
    Plot: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
    Runtime: '60 min', Language: 'English', Country: 'United States, Poland', Released: '20 Dec 2019'
  },
  {
    imdbID: 'tt1442437', Title: 'Money Heist', Year: '2017–2021', Type: 'series',
    Poster: 'https://m.media-amazon.com/images/M/MV5BNWZmMjhjYmYtNDI5Yi00ZjJiLTk3MzAtYjIzOWQ4OGE3ZmZlXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
    Genre: 'Action, Crime, Mystery', imdbRating: '8.2', Director: 'Álex Pina',
    Actors: 'Álvaro Morte, Itziar Ituño, Pedro Alonso',
    Plot: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    Runtime: '70 min', Language: 'Spanish', Country: 'Spain', Released: '02 May 2017'
  }
];

const CATEGORY_MAPPINGS = [
  { imdbID: 'tt0848228', category: 'Hollywood' },
  { imdbID: 'tt4154796', category: 'Hollywood' },
  { imdbID: 'tt1375666', category: 'Hollywood' },
  { imdbID: 'tt0468569', category: 'Hollywood' },
  { imdbID: 'tt0110912', category: 'Hollywood' },
  { imdbID: 'tt0137523', category: 'Hollywood' },
  { imdbID: 'tt6751668', category: 'Hollywood' },
  { imdbID: 'tt0816692', category: 'Hollywood' },
  { imdbID: 'tt12844910', category: 'Bollywood' },
  { imdbID: 'tt10838180', category: 'Bollywood' },
  { imdbID: 'tt8108198', category: 'Tollywood' },
  { imdbID: 'tt9052864', category: 'Tollywood' },
  { imdbID: 'tt13186482', category: 'Kollywood' },
  { imdbID: 'tt15078374', category: 'Kollywood' },
  { imdbID: 'tt9476812', category: 'Mollywood' },
  { imdbID: 'tt11731770', category: 'Mollywood' },
  { imdbID: 'tt5491994', category: 'Series' },
  { imdbID: 'tt0903747', category: 'Series' },
  { imdbID: 'tt4574334', category: 'Series' },
  { imdbID: 'tt7366338', category: 'Series' },
  { imdbID: 'tt0108778', category: 'Series' },
  { imdbID: 'tt0944947', category: 'Series' },
  { imdbID: 'tt5180504', category: 'Series' },
  { imdbID: 'tt1442437', category: 'Series' }
];

const CategoryMovie = require('./models/CategoryMovie');
const MovieCache    = require('./models/MovieCache');

const seedDatabase = async () => {
  try {
    // Seed category mappings
    const catCount = await CategoryMovie.countDocuments();
    if (catCount === 0) {
      console.log('Seeding category mappings...');
      await CategoryMovie.insertMany(CATEGORY_MAPPINGS);
      console.log('Category mappings seeded!');
    }

    // Seed full movie details into cache
    const cacheCount = await MovieCache.countDocuments();
    if (cacheCount === 0) {
      console.log('Seeding full movie details into MovieCache...');
      // Use upsert so re-seeding never creates duplicates
      for (const movie of FULL_MOVIE_DATA) {
        await MovieCache.findOneAndUpdate(
          { imdbID: movie.imdbID },
          movie,
          { upsert: true, new: true }
        );
      }
      console.log(`${FULL_MOVIE_DATA.length} movies seeded into cache!`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

seedDatabase();

// Routes Mappings
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/movies',    require('./routes/movies'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Server is running perfectly' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

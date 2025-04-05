// services/api.js
const API_KEY = 'a87adebc'; // You'll need to get your own API key from http://www.omdbapi.com/

export const fetchMovies = async (searchTerm = 'popular', page = 1) => {
  try {
    // If no search term, default to some popular movies
    const defaultSearches = ['star wars', 'marvel', 'lord of the rings', 'harry potter'];
    const query = searchTerm === 'popular' 
      ? defaultSearches[Math.floor(Math.random() * defaultSearches.length)] 
      : searchTerm;
    
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${page}&type=movie`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch movies');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const fetchMovieDetails = async (imdbID) => {
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch movie details');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};


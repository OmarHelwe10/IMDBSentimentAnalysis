import React, { useState, useEffect, useCallback } from 'react';
import MovieCard from './components/MovieCard';
import MovieDetails from './components/MovieDetails';
import SearchBar from './components/SearchBar';
import { fetchMovies, fetchMovieDetails } from './services/api';
import './App.css';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Wrap loadMovies in useCallback to prevent unnecessary re-renders
  const loadMovies = useCallback(async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const term = search || searchTerm || 'popular';
      const data = await fetchMovies(term, page);
      
      setMovies(data.Search || []);
      setTotalResults(Number(data.totalResults) || 0);
    } catch (err) {
      setError('Failed to fetch movies. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]); // Add dependencies here

  useEffect(() => {
    loadMovies();
  }, [page, loadMovies]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
    loadMovies(term);
  };

  const handleSelectMovie = async (movie) => {
    try {
      setSelectedMovie(movie);
      
      // Fetch detailed information for the selected movie
      const details = await fetchMovieDetails(movie.imdbID);
      setSelectedMovieDetails(details);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      // Still show the movie with limited info if details fetch fails
      setSelectedMovieDetails(null);
    }
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
    setSelectedMovieDetails(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log("Submitting review:", reviewData);
      
      const response = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });
  
      const data = await response.json();
      const sentiment = data.sentiment || "Unknown"; // Handle missing sentiment gracefully
  
      console.log("Sentiment:", sentiment);
  
      return { success: true, message: `Review for "${reviewData.title}" submitted! Sentiment: ${sentiment}` };
    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false, message: "Failed to submit review." };
    }
  };


  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Movie Review App</h1>
        <SearchBar onSearch={handleSearch} />
      </header>
      
      <main className="app-main">
        {loading && page === 1 ? (
          <div className="loading">Loading movies...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : movies.length === 0 ? (
          <div className="no-results">No movies found. Try a different search term.</div>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map(movie => (
                <MovieCard 
                  key={movie.imdbID}
                  movie={movie}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
            </div>
            
            {loading && page > 1 && (
              <div className="loading-more">Loading more movies...</div>
            )}
            
            {!loading && movies.length < totalResults && (
              <div className="load-more">
                <button onClick={handleLoadMore}>Load More</button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovieDetails || selectedMovie}
          onClose={handleCloseDetails}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default App;

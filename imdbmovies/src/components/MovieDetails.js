// components/MovieDetails.js
import React, { useState } from 'react';

const MovieDetails = ({ movie, onClose, onSubmitReview }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [sentiment, setSentiment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSentiment(null);
  
    const reviewData = {
      movieId: movie.imdbID, // Unique identifier
      title: movie.Title, // Movie title
      rating, // User-selected rating
      comment: review, // User input review
      timestamp: new Date().toISOString() // Optional timestamp
    };
  
    const result = await onSubmitReview(reviewData);
  
    setSubmitMessage(result);
    setSubmitting(false);
  
    if (result.success) {
      if (result.message.includes('Sentiment:')) {
        const sentimentValue = result.message.split('Sentiment:')[1].trim();
        setSentiment(sentimentValue);
      }
  
      // Reset form after successful submission
      setReview('');
      setRating(5);
  
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
    }
  };
  

  const getSentimentClass = () => {
    if (!sentiment) return '';
    
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes('positive')) return 'positive';
    if (lowerSentiment.includes('negative')) return 'negative';
    return 'neutral';
  };

  return (
    <div className="movie-details-overlay">
      <div className="movie-details">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="movie-details-header">
          <div className="movie-details-poster">
            {movie.Poster && movie.Poster !== 'N/A' ? (
              <img src={movie.Poster} alt={`${movie.Title} poster`} />
            ) : (
              <div className="no-poster large">No Poster Available</div>
            )}
          </div>
          <div className="movie-details-info">
            <h2>{movie.Title} ({movie.Year})</h2>
            {movie.imdbRating && (
              <div className="movie-rating">⭐ {movie.imdbRating}/10</div>
            )}
            {movie.Runtime && (
              <div className="movie-runtime"><strong>Runtime:</strong> {movie.Runtime}</div>
            )}
            {movie.Genre && (
              <div className="movie-genre"><strong>Genre:</strong> {movie.Genre}</div>
            )}
            {movie.Director && movie.Director !== 'N/A' && (
              <div className="movie-director"><strong>Director:</strong> {movie.Director}</div>
            )}
            {movie.Actors && movie.Actors !== 'N/A' && (
              <div className="movie-actors"><strong>Actors:</strong> {movie.Actors}</div>
            )}
          </div>
        </div>
        
        {movie.Plot && movie.Plot !== 'N/A' && (
          <div className="movie-plot">
            <h3>Plot</h3>
            <p>{movie.Plot}</p>
          </div>
        )}
        
        <div className="review-section">
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="rating-input">
              <label htmlFor="rating">Rating:</label>
              <select 
                id="rating" 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div className="review-input">
              <label htmlFor="review">Your Review:</label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={5}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-review-button"
              disabled={submitting}
            >
              {submitting ? 'Analyzing...' : 'Submit Review'}
            </button>
            
            {submitMessage && (
              <div className={`submit-message ${submitMessage.success ? 'success' : 'error'}`}>
                {submitMessage.message.split('Sentiment:')[0]}
                {sentiment && (
                  <div className={`sentiment-result ${getSentimentClass()}`}>
                    Sentiment: {sentiment}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;


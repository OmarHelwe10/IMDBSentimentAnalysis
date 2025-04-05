import React from 'react';

const MovieCard = ({ movie, onClick }) => {
  return (
    <div className="movie-card" onClick={onClick}>
      <div className="movie-poster">
        {movie.Poster && movie.Poster !== 'N/A' ? (
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
        ) : (
          <div className="no-poster">No Poster Available</div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        <div className="movie-year">{movie.Year}</div>
        <div className="movie-type">{movie.Type}</div>
      </div>
    </div>
  );
};

export default MovieCard;
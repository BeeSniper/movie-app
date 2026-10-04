import { useState } from 'react';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
}

export function MovieCard({ movie, isFavorite, onToggleFavorite }: MovieCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="movie-card">
      <div className="movie-poster-wrapper">
        {movie.poster && !imageFailed ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-poster"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span>No poster</span>
          </div>
        )}
        <button
          type="button"
          className="favorite-button"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => onToggleFavorite(movie)}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="movie-details">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-year">{movie.year}</span>
          <span className="movie-type">{movie.type}</span>
        </div>
      </div>
    </article>
  );
}

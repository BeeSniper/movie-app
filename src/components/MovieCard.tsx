import { useState } from 'react';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="movie-card">
      <div className="movie-poster-wrapper">
        {movie.poster && !imageFailed ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-poster" onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span>No poster</span>
          </div>
        )}
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

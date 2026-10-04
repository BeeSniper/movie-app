import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  isFavorite: (imdbID: string) => boolean;
  onToggleFavorite: (movie: Movie) => void;
}

export function MovieGrid({ movies, isFavorite, onToggleFavorite }: MovieGridProps) {
  return (
    <section className="movie-grid" aria-label="Movies list">
      {movies.map((movie) => (
        <MovieCard
          key={movie.imdbID}
          movie={movie}
          isFavorite={isFavorite(movie.imdbID)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  );
}

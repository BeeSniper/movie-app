import type { Movie } from '../types/movie';

const STORAGE_KEY = 'movie-app:favorites';

function toStoredMovie(item: unknown): Movie | null {
  if (typeof item !== 'object' || item === null) {
    return null;
  }
  const candidate = item as Record<string, unknown>;
  if (typeof candidate.imdbID !== 'string' || candidate.imdbID.trim().length === 0) {
    return null;
  }
  return {
    imdbID: candidate.imdbID,
    title: typeof candidate.title === 'string' ? candidate.title : '',
    year: typeof candidate.year === 'string' ? candidate.year : '',
    type: typeof candidate.type === 'string' ? candidate.type : '',
    poster: typeof candidate.poster === 'string' ? candidate.poster : '',
  };
}

export function loadFavorites(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const movies: Movie[] = [];
    for (const item of parsed) {
      const movie = toStoredMovie(item);
      if (movie) {
        movies.push(movie);
      }
    }
    return movies;
  } catch {
    return [];
  }
}

export function saveFavorites(movies: Movie[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch {
    // Catch storage errors without throwing or logging data
  }
}

export function isFavorite(current: Movie[], imdbID: string): boolean {
  return current.some((movie) => movie.imdbID === imdbID);
}

export function toggleFavorite(current: Movie[], movie: Movie): Movie[] {
  if (isFavorite(current, movie.imdbID)) {
    return current.filter((m) => m.imdbID !== movie.imdbID);
  }
  return [...current, movie];
}

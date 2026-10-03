import type { Movie, OmdbMovieItem } from '../../types/movie';
import { searchMovies } from '../../services/omdbClient';

// Seed keywords used to populate the initial home screen
export const SEED_KEYWORDS: readonly string[] = [
  'Batman',
  'Avengers',
  'Star Wars',
  'Spider-Man',
  'Harry Potter',
];

/**
 * Transforms an OMDB raw response item into our application's domain Movie model.
 */
export function toMovie(item: OmdbMovieItem): Movie {
  return {
    imdbID: item.imdbID,
    title: item.Title,
    year: item.Year,
    type: item.Type,
    poster: item.Poster === 'N/A' ? '' : item.Poster,
  };
}

/**
 * Returns a shuffled copy of the array using the Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fetches seed movies across multiple keywords concurrently.
 * Deduplicates by imdbID, shuffles results, and returns up to 20 items.
 * If one keyword fails, the other keyword results are still kept.
 */
export async function fetchSeedMovies(): Promise<Movie[]> {
  const settledResults = await Promise.allSettled(
    SEED_KEYWORDS.map((keyword) => searchMovies(keyword))
  );

  const allItems: OmdbMovieItem[] = [];

  for (const outcome of settledResults) {
    if (outcome.status === 'fulfilled') {
      allItems.push(...outcome.value);
    }
  }

  if (allItems.length === 0) {
    throw new Error('Could not load any seed movies. Please verify your internet connection or OMDB API key.');
  }

  // Deduplicate movies by unique imdbID
  const uniqueMoviesMap = new Map<string, Movie>();
  for (const item of allItems) {
    if (!uniqueMoviesMap.has(item.imdbID)) {
      uniqueMoviesMap.set(item.imdbID, toMovie(item));
    }
  }

  const uniqueMovies = Array.from(uniqueMoviesMap.values());
  const randomizedMovies = shuffle(uniqueMovies);

  return randomizedMovies.slice(0, 20);
}

/**
 * Searches OMDB for movies matching a specific query string.
 * Validates that the query has at least 2 characters.
 */
export async function searchByQuery(query: string): Promise<Movie[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    throw new Error('Search query must be at least 2 characters long.');
  }

  const items = await searchMovies(trimmedQuery);
  return items.map(toMovie);
}

import { useState, useEffect } from 'react';
import type { Movie } from '../../types/movie';
import { fetchSeedMovies } from './HomeModel';

export function useHomeViewModel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSeedMovies()
      .then((seedMovies) => {
        setMovies(seedMovies);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setErrorMessage(message);
        setIsLoading(false);
      });
  }, []);

  return {
    movies,
    isLoading,
    errorMessage,
  };
}

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Movie } from '../../types/movie';
import { fetchSeedMovies, searchByQuery } from './HomeModel';

export function useHomeViewModel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setErrorMessage(null);

    const loadAction = q === null ? fetchSeedMovies() : searchByQuery(q);

    loadAction
      .then((loadedMovies) => {
        if (!cancelled) {
          setMovies(loadedMovies);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
          setErrorMessage(message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  return {
    movies,
    isLoading,
    errorMessage,
  };
}

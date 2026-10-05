import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import type { Movie } from '../types/movie';
import {
  loadFavorites,
  saveFavorites,
  toggleFavorite,
  isFavorite as checkIsFavorite,
} from '../models/FavoritesModel';

interface FavoritesContextValue {
  favorites: Movie[];
  isFavorite: (imdbID: string) => boolean;
  toggle: (movie: Movie) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Movie[]>(() => loadFavorites());

  // Keep a ref synchronized with the latest favorites list so rapid consecutive
  // toggles before a React re-render do not read stale state.
  const favoritesRef = useRef<Movie[]>(favorites);
  favoritesRef.current = favorites;

  function toggle(movie: Movie) {
    const updated = toggleFavorite(favoritesRef.current, movie);
    favoritesRef.current = updated;
    saveFavorites(updated);
    setFavorites(updated);
  }

  function isFavorite(imdbID: string): boolean {
    return checkIsFavorite(favorites, imdbID);
  }

  const value: FavoritesContextValue = {
    favorites,
    isFavorite,
    toggle,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

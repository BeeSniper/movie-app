import { createContext, useContext, useState, type ReactNode } from 'react';
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

  function toggle(movie: Movie) {
    setFavorites((prev) => {
      const updated = toggleFavorite(prev, movie);
      saveFavorites(updated);
      return updated;
    });
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

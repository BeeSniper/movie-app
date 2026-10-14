import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Movie } from '../types/movie';
import {
  loadFavorites as loadLocalFavorites,
  saveFavorites as saveLocalFavorites,
  toggleFavorite,
  isFavorite as checkIsFavorite,
} from '../models/FavoritesModel';
import {
  loadFavorites as loadUserFavorites,
  saveFavorites as saveUserFavorites,
} from '../models/UserDataModel';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Movie[];
  isFavorite: (imdbID: string) => boolean;
  toggle: (movie: Movie) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  const [favorites, setFavorites] = useState<Movie[]>(() =>
    !isLoading && !user ? loadLocalFavorites() : []
  );

  // Keep a ref synchronized with the latest favorites list so rapid consecutive
  // toggles before a React re-render do not read stale state.
  const favoritesRef = useRef<Movie[]>(favorites);
  favoritesRef.current = favorites;

  // Track whether a successful load has completed for the current signed-in user.
  const isLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      isLoadedRef.current = false;
      const local = loadLocalFavorites();
      favoritesRef.current = local;
      setFavorites(local);
      return;
    }

    let cancelled = false;
    isLoadedRef.current = false;
    favoritesRef.current = [];
    setFavorites([]);

    void loadUserFavorites(user.uid).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        favoritesRef.current = result.favorites;
        setFavorites(result.favorites);
        isLoadedRef.current = true;
      } else {
        favoritesRef.current = [];
        setFavorites([]);
        isLoadedRef.current = false;
      }
    });

    return () => {
      cancelled = true;
      isLoadedRef.current = false;
    };
  }, [user, isLoading]);

  function toggle(movie: Movie) {
    if (isLoading) {
      return;
    }

    const updated = toggleFavorite(favoritesRef.current, movie);
    favoritesRef.current = updated;

    if (user) {
      if (isLoadedRef.current) {
        void saveUserFavorites(user.uid, updated);
      }
    } else {
      saveLocalFavorites(updated);
    }

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

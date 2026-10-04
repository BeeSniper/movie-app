import { useHomeViewModel } from './useHomeViewModel';
import { MovieGrid } from '../../components/MovieGrid';
import { useFavorites } from '../../context/FavoritesContext';

export function HomeScreen() {
  const { movies, isLoading, errorMessage } = useHomeViewModel();
  const { isFavorite, toggle } = useFavorites();

  return (
    <main className="home-screen">
      {isLoading && (
        <div className="status-message">
          <p>Loading movies...</p>
        </div>
      )}

      {errorMessage && (
        <div className="error-box" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <MovieGrid
          movies={movies}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
        />
      )}
    </main>
  );
}

import { useFavorites } from '../../context/FavoritesContext';
import { MovieGrid } from '../../components/MovieGrid';

export function FavoritesScreen() {
  const { favorites, isFavorite, toggle } = useFavorites();

  return (
    <main className="favorites-screen">
      <h2>Favorites</h2>
      {favorites.length === 0 ? (
        <p className="favorites-empty-message">
          No favorites yet. Add some from the Home page.
        </p>
      ) : (
        <MovieGrid
          movies={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
        />
      )}
    </main>
  );
}

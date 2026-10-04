import { useHomeViewModel } from './useHomeViewModel';
import { MovieGrid } from '../../components/MovieGrid';

export function HomeScreen() {
  const { movies, isLoading, errorMessage } = useHomeViewModel();

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

      {!isLoading && !errorMessage && <MovieGrid movies={movies} />}
    </main>
  );
}

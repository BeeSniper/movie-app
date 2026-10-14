import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isLoading, logOut } = useAuth();
  const { syncError } = useFavorites();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(searchTerm)}`);
  }

  function handleHomeClick() {
    setSearchTerm('');
  }

  async function handleLogOut() {
    setLogoutError(null);
    try {
      await logOut();
    } catch {
      setLogoutError('Could not log out. Please try again.');
    }
  }

  const errorMessage = syncError || logoutError;

  return (
    <>
      <header className="app-header">
        <nav className="header-nav">
          <Link to="/" className="nav-link" onClick={handleHomeClick}>
            Home
          </Link>
          <Link to="/favorites" className="nav-link">
            Favorites
          </Link>
        </nav>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {!isLoading && (
          <div className="header-auth">
            {user ? (
              <>
                <span className="user-email">{user.email}</span>
                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogOut}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-link">
                Log in
              </Link>
            )}
          </div>
        )}
      </header>
      {errorMessage && (
        <div role="alert" className="sync-error">
          {errorMessage}
        </div>
      )}
    </>
  );
}

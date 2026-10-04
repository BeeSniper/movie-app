import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(searchTerm)}`);
  }

  function handleHomeClick() {
    setSearchTerm('');
  }

  return (
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
    </header>
  );
}

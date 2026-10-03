import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { fetchSeedMovies } from './screens/home/HomeModel';

// TEMPORARY TEST (Step 2): Log only movie titles to verify connection
fetchSeedMovies()
  .then((movies) => {
    console.log('--- Step 2 Test: Loaded Movie Titles ---');
    movies.forEach((movie) => console.log(`- ${movie.title} (${movie.year})`));
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Step 2 Test Error:', message);
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

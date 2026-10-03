import type { OmdbMovieItem, OmdbSearchResponse } from '../types/movie';

// Retrieve configuration from Vite environment variables
const rawBaseUrl = import.meta.env.VITE_OMDB_BASE_URL;
const apiKey = import.meta.env.VITE_OMDB_API_KEY;

// Normalize the base URL by stripping trailing slashes
const baseUrl = (rawBaseUrl || '').replace(/\/+$/, '');

/**
 * Searches OMDB API by keyword.
 * Throws a user-readable Error if validation, network, or OMDB request fails.
 * Never logs or exposes the API key or complete URL.
 */
export async function searchMovies(keyword: string): Promise<OmdbMovieItem[]> {
  if (!apiKey) {
    throw new Error('OMDB API key is missing. Please check your .env configuration.');
  }

  if (!baseUrl) {
    throw new Error('OMDB Base URL is missing. Please check your .env configuration.');
  }

  const encodedKeyword = encodeURIComponent(keyword.trim());
  const url = `${baseUrl}/?s=${encodedKeyword}&apikey=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network error: Unable to connect to OMDB API.');
  }

  if (!response.ok) {
    throw new Error(`OMDB API request failed with status: ${response.status}`);
  }

  const data: OmdbSearchResponse = await response.json();

  // Check the Response discriminator in the OmdbSearchResponse union
  if (data.Response === 'False') {
    throw new Error(data.Error || 'Failed to find movies for this search term.');
  }

  return data.Search;
}

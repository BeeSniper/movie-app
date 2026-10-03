// Shared domain model for a movie in our application
export interface Movie {
  imdbID: string;
  title: string;
  year: string;
  type: string;
  poster: string;
}

// Raw item structure returned by the OMDB API
export interface OmdbMovieItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

// Successful search response from OMDB API
export interface OmdbSearchSuccessResponse {
  Response: 'True';
  Search: OmdbMovieItem[];
  totalResults: string;
}

// Error response from OMDB API (e.g. "Movie not found!", "Too many results.")
export interface OmdbSearchErrorResponse {
  Response: 'False';
  Error: string;
}

// Union response type
export type OmdbSearchResponse = OmdbSearchSuccessResponse | OmdbSearchErrorResponse;

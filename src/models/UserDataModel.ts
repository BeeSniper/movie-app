import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Movie } from '../types/movie';

export type LoadResult =
  | { ok: true; favorites: Movie[] }
  | { ok: false; message: string };

export type SaveResult =
  | { ok: true }
  | { ok: false; message: string };

function mapFirestoreError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string') {
      if (code === 'permission-denied' || code === 'firestore/permission-denied') {
        return 'You do not have permission to perform this action.';
      }
      if (code === 'unavailable' || code === 'firestore/unavailable') {
        return 'Service is temporarily unavailable. Please try again later.';
      }
    }
  }
  return 'An unexpected database error occurred. Please try again.';
}

function isValidUid(uid: unknown): uid is string {
  return typeof uid === 'string' && uid.trim().length > 0;
}

function toStoredMovie(item: unknown): Movie | null {
  if (typeof item !== 'object' || item === null) {
    return null;
  }
  const candidate = item as Record<string, unknown>;
  if (typeof candidate.imdbID !== 'string' || candidate.imdbID.trim().length === 0) {
    return null;
  }
  return {
    imdbID: candidate.imdbID,
    title: typeof candidate.title === 'string' ? candidate.title : '',
    year: typeof candidate.year === 'string' ? candidate.year : '',
    type: typeof candidate.type === 'string' ? candidate.type : '',
    poster: typeof candidate.poster === 'string' ? candidate.poster : '',
  };
}

export async function loadFavorites(uid: string): Promise<LoadResult> {
  if (!isValidUid(uid)) {
    return { ok: false, message: 'Invalid user ID.' };
  }

  try {
    const userDocRef = doc(db, 'users', uid.trim());
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return { ok: true, favorites: [] };
    }

    const data = docSnap.data();
    if (!data || !('favorites' in data) || !Array.isArray(data.favorites)) {
      return { ok: true, favorites: [] };
    }

    const favorites: Movie[] = [];
    for (const item of data.favorites) {
      const movie = toStoredMovie(item);
      if (movie) {
        favorites.push(movie);
      }
    }

    return { ok: true, favorites };
  } catch (error) {
    return { ok: false, message: mapFirestoreError(error) };
  }
}

export async function saveFavorites(uid: string, favorites: Movie[]): Promise<SaveResult> {
  if (!isValidUid(uid)) {
    return { ok: false, message: 'Invalid user ID.' };
  }

  try {
    const safeFavorites = Array.isArray(favorites) ? favorites : [];
    const sanitizedFavorites: Movie[] = safeFavorites
      .filter((item): item is Movie => typeof item === 'object' && item !== null)
      .map((movie) => ({
        imdbID: typeof movie.imdbID === 'string' ? movie.imdbID : '',
        title: typeof movie.title === 'string' ? movie.title : '',
        year: typeof movie.year === 'string' ? movie.year : '',
        type: typeof movie.type === 'string' ? movie.type : '',
        poster: typeof movie.poster === 'string' ? movie.poster : '',
      }));

    const userDocRef = doc(db, 'users', uid.trim());
    await setDoc(userDocRef, { favorites: sanitizedFavorites }, { merge: true });

    return { ok: true };
  } catch (error) {
    return { ok: false, message: mapFirestoreError(error) };
  }
}

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';

export type AuthUser = {
  uid: string;
  email: string | null;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

function mapAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string') {
      switch (code) {
        case 'auth/email-already-in-use':
          return 'This email is already in use.';
        case 'auth/weak-password':
          return 'Password is too weak.';
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection.';
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 'Incorrect email or password.';
        default:
          return 'Authentication failed. Please try again.';
      }
    }
  }
  return 'Authentication failed. Please try again.';
}

function validateCredentials(
  email: string,
  password: string
): { ok: false; message: string } | { ok: true; trimmedEmail: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, message: 'Email is required.' };
  }
  if (!trimmedEmail.includes('@')) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
  }
  return { ok: true, trimmedEmail };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const validation = validateCredentials(email, password);
  if (!validation.ok) {
    return validation;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, validation.trimmedEmail, password);
    return {
      ok: true,
      user: {
        uid: credential.user.uid,
        email: credential.user.email,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: mapAuthError(error),
    };
  }
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const validation = validateCredentials(email, password);
  if (!validation.ok) {
    return validation;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, validation.trimmedEmail, password);
    return {
      ok: true,
      user: {
        uid: credential.user.uid,
        email: credential.user.email,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: mapAuthError(error),
    };
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
      });
    } else {
      callback(null);
    }
  });
}

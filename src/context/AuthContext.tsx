import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, AuthResult } from '../models/AuthModel';
import { signUp, logIn, logOut, subscribeToAuth } from '../models/AuthModel';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  logIn: (email: string, password: string) => Promise<AuthResult>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    return subscribeToAuth((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    signUp,
    logIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

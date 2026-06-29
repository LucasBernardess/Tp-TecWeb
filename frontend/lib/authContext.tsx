"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type AuthUser,
  getStoredUser,
  signIn as signInRequest,
  signUp as signUpRequest,
  signOut as signOutRequest,
} from "./auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (login: string, senha: string) => Promise<void>;
  signUp: (login: string, senha: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  async function signIn(login: string, senha: string) {
    const u = await signInRequest(login, senha);
    setUser(u);
  }

  async function signUp(login: string, senha: string) {
    const u = await signUpRequest(login, senha);
    setUser(u);
  }

  function signOut() {
    signOutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

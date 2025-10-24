import React, { createContext, useCallback, useEffect, useState, useContext } from "react";
import api, { setAccessToken as setApiAccessToken } from "@/api/api";
import { logoutUser } from "@/api/auth";

type AuthContextType = {
  user: any;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "accessToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<any>(null);

  // Helper: decode JWT payload safely
  const decodeJwt = (jwt?: string | null): any | null => {
    if (!jwt) return null;
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    try {
      const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // Ensure axios/header is set whenever token state changes
  useEffect(() => {
    if (token) {
      setApiAccessToken(token);
    } else {
      setApiAccessToken(null as any);
    }
  }, [token]);

  // Fetch profile for the current token; ignore outdated responses
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;
    const currentToken = token;

    // 1) Otimização UX: preenche user imediatamente com claims do JWT (fallback),
    //    depois tenta confirmar com /profile. Mantém a sessão visível no F5.
    const claims = decodeJwt(currentToken);
    if (claims) {
      const fallbackUser = {
        id: claims.id || claims.sub || null,
        email: claims.email || null,
        name: claims.name || null,
        userType: claims.userType || claims.role || null,
        _claims: true,
      };
      setUser((prev: any) => prev || fallbackUser);
    }

    (async () => {
      try {
        const res = await api.get("/api/auth/profile");
        // if token changed since request started, ignore this response
        if (cancelled || currentToken !== token) return;
        const profile = res?.data?.data ?? null;
        // Guard: if backend returned a profile that doesn't match token claims, don't overwrite
        const claims = decodeJwt(currentToken);
        const claimEmail = claims?.email || claims?.sub || null;
        if (profile && claimEmail) {
          const sameIdentity = profile?.email === claimEmail || profile?.id === claimEmail;
          if (!sameIdentity) {
            console.warn("[Auth] Ignorando perfil que não corresponde ao token", { claimEmail, profileEmail: profile?.email, profileId: profile?.id });
            return;
          }
        }
        setUser(profile);
      } catch (err) {
        // Somente limpar se for 401 (token inválido/expirado). Outros erros (rede, 5xx) mantém sessão.
        const status = (err && typeof err === 'object' && 'response' in err && (err as any).response?.status) || undefined;
        if (!cancelled && status === 401) {
          setUser(null);
          setToken(null);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
          setApiAccessToken(null as any);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((newUser: any, newToken: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, newToken);
    } catch {}
    setToken(newToken);
    setApiAccessToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setToken(null);
    setUser(null);
    setApiAccessToken(null as any);
    // fire-and-forget server logout
    logoutUser().catch(() => {});
    
    // Redirecionar para home após logout
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return {
    user: ctx.user,
    token: ctx.token,
    login: ctx.login,
    logout: ctx.logout,
    // Considera autenticado se há token; user pode ser claims até carregar /profile
    isAuthenticated: !!ctx.token,
  };
}

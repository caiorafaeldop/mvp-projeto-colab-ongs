import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, getUserProfile, logoutUser } from "@/api/auth";
import { getAccessToken } from "@/api/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const response = await getUserProfile();
        if (response.success) {
          setUser(response.user);
        } else {
          // Só faz logout se a resposta indicar que o token é inválido
          logout();
        }
      }
    } catch (error: unknown) {
      console.error("Error refreshing user:", error);
      // Só faz logout se for erro 401 (não autorizado)
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        logout();
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Não faz logout automático na inicialização
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

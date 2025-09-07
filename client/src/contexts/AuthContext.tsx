import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getUserProfile, logoutUser, refreshToken } from "@/api/auth";
import { setAccessToken, getAccessToken } from "@/api/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
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

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    logoutUser(); // chama sua API de logout
    setUser(null);
    setAccessToken(null);
  };

  const refreshUser = async () => {
    try {
      const refreshData = await refreshToken();
      if (!refreshData?.accessToken) throw new Error("Não foi possível renovar token");

      setAccessToken(refreshData.accessToken);

      const profileResponse = await getUserProfile();
      if (!profileResponse.success) throw new Error("Não foi possível buscar perfil");

      setUser(profileResponse.data);
    } catch (error) {
      console.error("[AuthProvider] Erro em refreshUser:", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const savedToken = getAccessToken();
        if (savedToken) {
          setAccessToken(savedToken); // aplica token no axios
          const profileResponse = await getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("[AuthProvider] Erro ao inicializar auth:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

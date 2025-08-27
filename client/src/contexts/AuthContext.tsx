import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, getUserProfile, logoutUser } from "@/api/auth";
import { getAccessToken, setAccessToken } from "@/api/api"; // Importe setAccessToken

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void; // Adicione token como parâmetro
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
    setAccessToken(token); // Salva o token no localStorage
  };

  const logout = () => {
    logoutUser(); // Chama API para logout (se necessário)
    setUser(null);
    setAccessToken(null); // Limpa o token
  };

  const refreshUser = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const response = await getUserProfile();
        if (response.success) {
          setUser(response.user);
        } else {
          logout();
        }
      }
    } catch (error: unknown) {
      console.error("Error refreshing user:", error);
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
          try {
            const response = await getUserProfile();
            if (response.success) {
              setUser(response.user);
            } else {
              // Token is invalid, clear it
              setAccessToken(null);
              setUser(null);
            }
          } catch (error) {
            console.error("Error getting user profile:", error);
            // Token is invalid or expired, clear it
            setAccessToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
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

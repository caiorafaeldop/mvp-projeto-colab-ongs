import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, getUserProfile, logoutUser, refreshToken } from "@/api/auth";
import { setAccessToken } from "@/api/api";

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
    console.log("[AuthProvider] Login - Dados do usuário:", userData, "Token:", token);
    setUser(userData);
    setAccessToken(token);
    console.log("[AuthProvider] Token salvo no login:", token);
  };

  const logout = () => {
    console.log("[AuthProvider] Fazendo logout...");
    logoutUser();
    setUser(null);
    setAccessToken(null);
    console.log("[AuthProvider] Logout concluído");
  };

  const refreshUser = async () => {
    try {
      console.log("[AuthProvider] Iniciando refreshUser...");
      try {
        const refreshData = await refreshToken();
        console.log("[AuthProvider] Dados do refreshToken:", refreshData);
        if (refreshData.accessToken) {
          setAccessToken(refreshData.accessToken);
          console.log("[AuthProvider] Novo accessToken salvo:", refreshData.accessToken);
        }
      } catch (refreshError) {
        console.error("[AuthProvider] Erro no refreshToken:", refreshError);
        logout();
        return;
      }
      
      console.log("[AuthProvider] Buscando perfil do usuário...");
      const response = await getUserProfile();
      console.log("[AuthProvider] Resposta do getUserProfile:", response);
      if (response.success) {
        setUser(response.user);
        console.log("[AuthProvider] Usuário atualizado:", response.user);
      } else {
        console.error("[AuthProvider] Falha ao buscar perfil, fazendo logout...");
        logout();
      }
    } catch (error: unknown) {
      console.error("[AuthProvider] Erro em refreshUser:", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[AuthProvider] Iniciando initializeAuth...");
        try {
          const refreshData = await refreshToken();
          console.log("[AuthProvider] Dados do refreshToken em initializeAuth:", refreshData);
          if (refreshData.accessToken) {
            setAccessToken(refreshData.accessToken);
            console.log("[AuthProvider] Novo accessToken salvo em initializeAuth:", refreshData.accessToken);
          }
          console.log("[AuthProvider] Buscando perfil do usuário em initializeAuth...");
          const profileResponse = await getUserProfile();
          console.log("[AuthProvider] Resposta do getUserProfile em initializeAuth:", profileResponse);
        
          if (profileResponse.success && profileResponse.data && profileResponse.data.id) {
            setUser(profileResponse.data);
            console.log("[AuthProvider] Usuário definido em initializeAuth:", profileResponse.data);
          } else {
            console.log("[AuthProvider] Falha ao buscar perfil ou ID undefined, limpando tokens...");
            console.log("[AuthProvider] Dados do perfil:", profileResponse.data);
            setAccessToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("[AuthProvider] Erro no refreshToken em initializeAuth:", error);
          setAccessToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("[AuthProvider] Erro geral em initializeAuth:", error);
        setAccessToken(null);
        setUser(null);
      } finally {
        console.log("[AuthProvider] Finalizando initializeAuth, isLoading = false");
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
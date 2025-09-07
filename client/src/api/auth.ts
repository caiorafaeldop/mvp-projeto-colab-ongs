import axios from "axios";
import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

// Login
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    console.log("[loginUser] Tentando login com:", data);
    const response = await api.post("/api/auth/login", data);
    console.log("[loginUser] Resposta do login:", response.data);
    
    // Verificar se o accessToken existe na resposta
    if (response.data.data && response.data.data.accessToken) {
      console.log("[loginUser] AccessToken encontrado:", response.data.data.accessToken);
      // Salvar o token imediatamente após o login
      const { setAccessToken } = await import("./api");
      setAccessToken(response.data.data.accessToken);
      console.log("[loginUser] Token salvo após login:", response.data.data.accessToken);
    } else {
      console.error("[loginUser] AccessToken não encontrado na resposta:", response.data);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("[loginUser] Erro ao fazer login:", error.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao fazer login"
    );
  }
};

// Register
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: string;
}): Promise<RegisterResponse> => {
  try {
    console.log("[registerUser] Tentando registro com:", data);
    const response = await api.post("/api/auth/register", data);
    console.log("[registerUser] Resposta do registro:", response.data);
    
    // Verificar se o accessToken existe na resposta
    if (response.data.data && response.data.data.accessToken) {
      console.log("[registerUser] AccessToken encontrado:", response.data.data.accessToken);
    } else {
      console.error("[registerUser] AccessToken não encontrado na resposta:", response.data);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("[registerUser] Erro ao criar conta:", error.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao criar conta"
    );
  }
};

// Get user profile
export const getUserProfile = async (): Promise<ProfileResponse> => {
  try {
    console.log("[getUserProfile] Buscando perfil do usuário...");
    const response = await api.get("/api/auth/profile");
    console.log("[getUserProfile] Resposta do perfil:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[getUserProfile] Erro ao buscar perfil:", error.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao buscar perfil"
    );
  }
};

// Refresh token
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  try {
    console.log("[refreshToken] Tentando renovar token...");
    const response = await axios.post('/api/auth/refresh', {}, {
      withCredentials: true 
    });
    console.log("[refreshToken] Resposta do refresh:", response.data);
    const newAccessToken = response.data.data.accessToken;
    console.log("[refreshToken] Novo accessToken:", newAccessToken);
    return { accessToken: newAccessToken };
  } catch (error: any) {
    console.error("[refreshToken] Erro ao renovar token:", error.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao renovar token"
    );
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    console.log("[logoutUser] Fazendo logout...");
    await api.post("/api/auth/logout");
    console.log("[logoutUser] Logout bem-sucedido");
  } catch (error: any) {
    console.error("[logoutUser] Erro ao fazer logout:", error.response?.data || error.message);
  }
};
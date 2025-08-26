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
    token: string;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

// Login
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  } catch (error: any) {
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
    const response = await api.post("/api/auth/register", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao criar conta"
    );
  }
};

// Get user profile
export const getUserProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get("/api/auth/profile");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao buscar perfil"
    );
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/api/auth/logout");
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error);
  }
};

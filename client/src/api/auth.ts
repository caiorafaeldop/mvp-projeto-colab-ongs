import api, { setAccessToken } from "./api";

export interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

// Description: Login user with email and password
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, user: { _id: string, name: string, email: string, userType: string }, token: string, message: string }
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/login", data);
    const result = response.data;

    if (result.success && result.token) {
      setAccessToken(result.token);
    }

    return result;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao fazer login"
    );
  }
};

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { name: string, email: string, password: string, phone: string, userType: string }
// Response: { success: boolean, user: { _id: string, name: string, email: string, userType: string }, token: string, message: string }
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/register", data);
    const result = response.data;

    if (result.success && result.token) {
      setAccessToken(result.token);
    }

    return result;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao registrar usuário"
    );
  }
};

// Description: Get user profile
// Endpoint: GET /api/auth/profile
// Response: { success: boolean, user: { _id: string, name: string, email: string, userType: string } }
export const getUserProfile = async (): Promise<{
  success: boolean;
  user: User;
}> => {
  try {
    const response = await api.get("/api/auth/profile");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao obter perfil do usuário"
    );
  }
};

// Description: Logout user
export const logoutUser = (): void => {
  setAccessToken(null);
};

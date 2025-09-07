import axios, {
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import JSONbig from "json-bigint";

// URL base do servidor backend
const API_BASE_URL = "http://localhost:3000";
const localApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => JSONbig.parse(data)],
});

let accessToken: string | null = null;

// Função para definir o token de acesso
export const setAccessToken = (token: string | null) => {
  console.log("[setAccessToken] Salvando token:", token);
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
    console.log("[setAccessToken] Token salvo no localStorage:", localStorage.getItem("accessToken"));
  } else {
    localStorage.removeItem("accessToken");
    console.log("[setAccessToken] Token removido do localStorage");
  }
};

// Função para obter o token de acesso
export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem("accessToken");
    console.log("[getAccessToken] Token recuperado do localStorage:", accessToken);
  } else {
    console.log("[getAccessToken] Token já em memória:", accessToken);
  }
  return accessToken;
};

// Interceptor para adicionar o token de autenticação automaticamente
localApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    console.log("[Interceptor Request] URL:", config.url);
    if (token && !isAuthEndpoint(config.url || "")) {
      console.log("[Interceptor Request] Adicionando Authorization: Bearer", token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("[Interceptor Request] Nenhum token adicionado para", config.url);
    }
    return config;
  },
  (error) => {
    console.error("[Interceptor Request] Erro:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e refresh token
localApi.interceptors.response.use(
  (response) => {
    console.log("[Interceptor Response] Resposta bem-sucedida para", response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.log("[Interceptor Response] Erro na requisição:", originalRequest.url, "Status:", error.response?.status);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log("[Interceptor Response] Tentando renovar token...");
        const response = await localApi.post('/api/auth/refresh');
        console.log("[Interceptor Response] Resposta do /refresh:", response.data);
        const newAccessToken = response.data.data.accessToken;
        console.log("[Interceptor Response] Novo accessToken:", newAccessToken);
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log("[Interceptor Response] Repetindo requisição para", originalRequest.url, "com novo token");
        return localApi(originalRequest);
      } catch (refreshError) {
        console.error("[Interceptor Response] Erro ao renovar token:", refreshError);
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401) {
      console.log("[Interceptor Response] Token inválido ou expirado:", error.response.data);
      setAccessToken(null);
    }
    
    return Promise.reject(error);
  }
);

const getApiInstance = () => {
  return localApi;
};

const isAuthEndpoint = (url: string): boolean => {
  const isAuth = url.includes("/api/auth/login") ||
                url.includes("/api/auth/register") ||
                url.includes("/api/auth/refresh") ||
                url.includes("/api/auth/logout");
  console.log("[isAuthEndpoint] URL:", url, "É endpoint de autenticação?", isAuth);
  return isAuth;
};

const api = {
  request: (config: AxiosRequestConfig) => {
    console.log("[API Request] Configuração:", config);
    const apiInstance = getApiInstance();
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    console.log("[API Get] URL:", url);
    const apiInstance = getApiInstance();
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    console.log("[API Post] URL:", url, "Data:", data);
    const apiInstance = getApiInstance();
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    console.log("[API Put] URL:", url, "Data:", data);
    const apiInstance = getApiInstance();
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    console.log("[API Delete] URL:", url);
    const apiInstance = getApiInstance();
    return apiInstance.delete(url, config);
  },
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    console.log("[API Patch] URL:", url, "Data:", data);
    const apiInstance = getApiInstance();
    return apiInstance.patch(url, data, config);
  },
};

// Função utilitária para verificar se o usuário está autenticado
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    console.log("[checkAuthStatus] Verificando status de autenticação...");
    await localApi.post('/api/auth/refresh');
    console.log("[checkAuthStatus] Refresh bem-sucedido");
    return true;
  } catch (error) {
    console.error("[checkAuthStatus] Erro ao verificar autenticação:", error);
    return false;
  }
};

export default api;
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
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// Função para obter o token de acesso
export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
};

// Interceptor para adicionar o token de autenticação automaticamente
localApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !isAuthEndpoint(config.url || "")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
localApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - apenas limpa o token
      // Deixa o AuthContext lidar com o redirecionamento
      setAccessToken(null);
    }
    return Promise.reject(error);
  }
);

const getApiInstance = () => {
  return localApi;
};

const isAuthEndpoint = (url: string): boolean => {
  return url.includes("/api/auth");
};

const api = {
  request: (config: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance.delete(url, config);
  },
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance();
    return apiInstance.patch(url, data, config);
  },
};

export default api;

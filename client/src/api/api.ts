import axios, {
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import JSONbig from "json-bigint";

// URL base do servidor backend 
const API_BASE_URL = "https://mvp-colab-ongs-backend.onrender.com";
//const API_BASE_URL = "http://localhost:3000";
const localApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => JSONbig.parse(data)],
});

// Função para definir o token de acesso
export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem("accessToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common["Authorization"];
  }
}

// opcional: pegar token salvo no localStorage
export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

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

    // 429: propaga informação para UI lidar com countdown
    if (error.response?.status === 429) {
      try {
        const retryAfterHeader = (error.response.headers || {})["retry-after"] as string | undefined;
        const retryAfterBody = (error.response.data as any)?.retryAfter;
        const retryAfter = parseInt((retryAfterHeader || retryAfterBody || "0") as string, 10) || 0;
        (error as any).isRateLimit = true;
        (error as any).retryAfter = retryAfter;
      } catch {}
      return Promise.reject(error);
    }

    // 401: não limpar token aqui. Deixe os fluxos de tela (AuthContext/profile) decidirem.
    if (error.response?.status === 401) {
      (error as any).isAuthError = true;
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

export default api;

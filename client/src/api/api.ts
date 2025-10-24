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
  withCredentials: true, // Importante: permite envio/recebimento de cookies
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

// Variável para controlar se já está renovando o token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

    // 401: tentar renovar o token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorData = error.response?.data as any;
      const isTokenExpired = errorData?.error === "TOKEN_EXPIRED" || errorData?.message === "Token expired";
      const shouldLogout = errorData?.shouldLogout === true;
      
      console.log("[Interceptor] Token expirado?", isTokenExpired, "Should logout?", shouldLogout);
      
      // Se backend indicou que deve fazer logout, não tenta renovar
      if (shouldLogout) {
        console.log("[Interceptor] Backend solicitou logout, redirecionando...");
        setAccessToken(null);
        window.location.href = "/";
        return Promise.reject(error);
      }
      
      if (isTokenExpired) {
        if (isRefreshing) {
          // Se já está renovando, aguarda na fila
          console.log("[Interceptor] Já renovando token, adicionando à fila");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return localApi(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        console.log("[Interceptor] Tentando renovar token...");
        
        return new Promise((resolve, reject) => {
          localApi
            .post("/api/auth/refresh", {}, {
              withCredentials: true, // Importante: envia cookies
            })
            .then((response) => {
              const newToken = response.data?.data?.accessToken || response.data?.data?.token || response.data?.token;
              console.log("[Interceptor] Token renovado com sucesso!");
              
              if (newToken) {
                setAccessToken(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                resolve(localApi(originalRequest));
              } else {
                console.error("[Interceptor] Nenhum token retornado pelo refresh");
                processQueue(new Error("No token returned"), null);
                reject(error);
              }
            })
            .catch((err) => {
              console.error("[Interceptor] Erro ao renovar token:", err);
              const shouldLogoutOnError = err?.response?.data?.shouldLogout === true;
              processQueue(err, null);
              // Limpa o token inválido
              setAccessToken(null);
              
              // Só redireciona se o backend explicitamente pediu
              if (shouldLogoutOnError) {
                console.log("[Interceptor] Refresh falhou e backend solicitou logout");
                window.location.href = "/";
              }
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

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

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  withCredentials: true, // send HttpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

// 401 → attempt silent token refresh, then retry once
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string): void {
  pendingQueue.forEach((cb) => cb(newToken));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          pendingQueue.push(resolve);
        }).then((token) => {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_BASE_URL as string}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(newToken);
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        pendingQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

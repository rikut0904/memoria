import axios from "axios";
import {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  clearAuthToken,
  clearRefreshToken,
} from "./auth";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURL = apiBase ? `${apiBase.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use(async (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthToken();
      clearRefreshToken();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post("/refresh", { refresh_token: refreshToken })
        .then((res) => {
          const newToken = res?.data?.token as string | undefined;
          const newRefresh = res?.data?.refresh_token as string | undefined;
          if (newToken) {
            setAuthToken(newToken);
          }
          if (newRefresh) {
            setRefreshToken(newRefresh);
          }
          return newToken || null;
        })
        .catch(() => {
          clearAuthToken();
          clearRefreshToken();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
    return api(originalRequest);
  },
);

export default api;

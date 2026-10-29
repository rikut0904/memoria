import axios from "axios";
import { getAuthToken } from "./auth";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURL = apiBase ? `${apiBase.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;

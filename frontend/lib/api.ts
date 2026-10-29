import axios from "axios";
import { getCurrentGroupId } from "./group";
import { getFreshAuthToken } from "./auth";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURL = apiBase ? `${apiBase.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use(async (config) => {
  const groupId = getCurrentGroupId();
  if (groupId) config.headers["X-Group-ID"] = String(groupId);
  const token = await getFreshAuthToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;

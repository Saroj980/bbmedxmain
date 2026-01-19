import axios from "axios";
import { useUserStore } from "@/store/userStore";

const BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { Accept: "application/json" },
});
axios.defaults.withCredentials = true;
// Attach access token
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const store = useUserStore.getState();
      const { refreshToken, user, permissions } = store;

      if (!refreshToken) {
        store.logout();
        return Promise.reject(error);
      }

      try {
        // Refresh access token
        const res = await axios.post(`${BASE_URL}/api/refresh-token`, {
          refresh_token: refreshToken,
        });

        // Update token in Zustand (user + permissions remain same)
        store.setAuth(
          res.data.token,
          refreshToken,
          user,
          permissions
        );

        // Retry the failed request
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return api(originalRequest);

      } catch (refreshError) {
        store.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

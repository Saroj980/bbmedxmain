import axios from "axios";
import { useUserStore } from "@/store/userStore";

const PROD_API_URL = "https://westernpharmacy.com.np";
const DEV_URL = "";
const BASE_URL = DEV_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { Accept: "application/json" },
  withCredentials: true,
});
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

// ----------------------------------------------------------------------------
// Request Deduplication (Mitigates React 18 Strict Mode double-fetching)
// ----------------------------------------------------------------------------
const pendingGetRequests = new Map<string, Promise<any>>();
const originalGet = api.get;

api.get = function (url: string, config?: any) {
  // Create a cache key based on URL and query params
  const key = url + (config?.params ? JSON.stringify(config.params) : '');

  // If a request for this exact endpoint is already in flight, return its promise
  if (pendingGetRequests.has(key)) {
    return pendingGetRequests.get(key) as Promise<any>;
  }

  const promise = originalGet.call(this, url, config).finally(() => {
    // Remove from pending map once resolved or rejected
    pendingGetRequests.delete(key);
  });

  pendingGetRequests.set(key, promise);
  return promise;
};

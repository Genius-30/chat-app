import axios from "axios";
import store from "@/store/store";
import { logout, login } from "@/store/authSlice";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Add a request interceptor to include the access token in headers
instance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors and attempt a token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await instance.get("/api/user/refresh-token");
        const { user, accessToken } = res.data;
        store.dispatch(login(user, accessToken));
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return instance(error.config); // Retry the original request with new token
      } catch (_error) {
        store.dispatch(logout());
        return Promise.reject(_error);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

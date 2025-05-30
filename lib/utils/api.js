"use client";

import axios from "axios";
import { toast } from "sonner";

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_API,
  withCredentials: true, // ✅ Automatically send cookies
});

const getTokenFromCookies = () => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
};

// ✅ Request interceptor: Attach token from cookies
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: Handle token expiration
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ If the response is 401 (Unauthorized), try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${BASE_API}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          const newAccessToken = refreshResponse.data.accessToken;
          processQueue(null, newAccessToken);

          // ✅ Retry the failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Generic API call function
export const apiCall = async (
  method,
  endpoint,
  payload = {},
  customHeaders = {}
) => {
  try {
    const url = `${endpoint}`;

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
    );

    const config = {
      method: method.toLowerCase(),
      url,
      headers: { ...customHeaders },
      ...(method.toLowerCase() === "get"
        ? { params: { ...cleanedPayload } }
        : { data: payload }),
    };

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    // if (status === 401) toast.error(message);
    // if (status === 403) toast.error(message);
    // if (status >= 500)
    //   toast.error("Something went wrong. Please try again later.");

    throw {
      status,
      message,
      original: error,
    };
  }
};

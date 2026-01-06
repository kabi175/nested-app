import { getMfaToken } from "@/services/mfaService";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuth0 } from "react-native-auth0";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const redirectClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_REDIRECT_URL,
  timeout: 10000,
});

// Request interceptor: Add auth token and MFA token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { getCredentials } = useAuth0();
    const credentials = await getCredentials();
    if (credentials) {
      config.headers.Authorization = `Bearer ${credentials.accessToken}`;
    }

    // Add MFA token if available
    const mfaToken = await getMfaToken();
    if (mfaToken) {
      config.headers["X-MFA-Token"] = mfaToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle MFA_REQUIRED errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 403 MFA_REQUIRED errors
    if (
      error.response?.status === 403 &&
      error.response?.data &&
      typeof error.response.data === "object" &&
      "errorCode" in error.response.data &&
      error.response.data.errorCode === "MFA_REQUIRED"
    ) {
      // Don't retry if we've already retried
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Clear expired/invalid MFA token
      const { clearMfaToken } = await import("@/services/mfaService");
      await clearMfaToken();

      // Return the error so the UI can handle it (e.g., show MFA modal)
      return Promise.reject({
        ...error,
        isMfaRequired: true,
        message:
          (error.response?.data as any)?.message ||
          "MFA verification required for this action",
      });
    }

    return Promise.reject(error);
  }
);

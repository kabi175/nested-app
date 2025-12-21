import { getAuth, getIdToken } from "@react-native-firebase/auth";
import axios from "axios";

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

api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await getIdToken(user);
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

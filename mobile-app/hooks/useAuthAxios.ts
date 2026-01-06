// useAuthAxios.ts
import { api } from "@/api/client";
import { useEffect } from "react";
import { useAuth0 } from "react-native-auth0";

export function useAuthAxios() {
  const { getCredentials } = useAuth0();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getCredentials();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getCredentials]);

  return api;
}

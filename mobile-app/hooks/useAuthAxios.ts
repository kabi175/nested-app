// useAuthAxios.ts
import { api } from "@/api/client";
import { router } from "expo-router";
import { useEffect } from "react";
import { CredentialsManagerError, useAuth0 } from "react-native-auth0";

export function useAuthAxios() {
  const { getCredentials } = useAuth0();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        let credential = await getCredentials();
        let expiresAt = credential.expiresAt + 19800000;
        const now = Math.floor(Date.now() / 1000);
        if (expiresAt >= now) {
          console.log("credential expired, refreshing");
          credential = await getCredentials(
            credential.scope,
            1 * 24 * 60 * 60, // min ttl is 1 day
            undefined,
            true
          );
        }
        config.headers.Authorization = `Bearer ${credential?.idToken}`;
        console.log("credential", credential);
      } catch (error) {
        console.log("error during credential refresh", error);
        if (error instanceof CredentialsManagerError) {
          router.replace("/sign-in");
        }
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getCredentials]);

  return api;
}

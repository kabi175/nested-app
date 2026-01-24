// useAuthAxios.ts
import { api } from "@/api/client";
import { clearNomineeAtoms } from "@/utils/nominee";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { CredentialsManagerError, useAuth0 } from "react-native-auth0";

export function useAuthAxios() {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        let credential = await getCredentials("offline_access", 36000);
        let expiresAt = credential.expiresAt;
        const now = Math.floor(Date.now() / 1000);
        if (now >= expiresAt) {
          console.log("credential expired, refreshing", expiresAt, now);
          credential = await getCredentials(
            credential.scope,
            undefined, // min ttl is 1 day
            undefined,
            true
          );
        }
        config.headers.Authorization = `Bearer ${credential?.idToken}`;
      } catch (error) {
        console.log("error during credential refresh", error);
        if (error instanceof CredentialsManagerError) {
          queryClient.clear();
          clearNomineeAtoms();
          router.replace("/sign-in");
        }
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getCredentials]);

  return api;
}

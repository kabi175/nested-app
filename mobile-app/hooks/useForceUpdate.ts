import { fetchVersionConfig, VersionConfig } from "@/api/versionApi";
import { isUpdateRequired } from "@/utils/version";
import { useQuery } from "@tanstack/react-query";
import * as Application from "expo-application";
import { Platform } from "react-native";

export interface ForceUpdateState {
  isUpdateRequired: boolean;
  config: VersionConfig | null;
  isLoading: boolean;
  error: Error | null;
  currentVersion: string;
}

export const useForceUpdate = (): ForceUpdateState => {
  const currentVersion = Application.nativeApplicationVersion || "0.0.0";

  const { data, isLoading, error } = useQuery({
    queryKey: ["versionConfig"],
    queryFn: fetchVersionConfig,
    staleTime: 1000 * 60 * 60, // 1 hour
  });


  const updateRequired = data 
    ? isUpdateRequired(currentVersion, data.minSupportedVersion)
    : false;

  return {
    isUpdateRequired: updateRequired,
    config: data || null,
    isLoading,
    error: error as Error | null,
    currentVersion,
  };
};

export const getStoreUrl = (config: VersionConfig | null): string => {
  if (!config) return "";
  return Platform.OS === "ios" ? config.iosUrl : config.androidUrl;
};

import { fetchVersionConfig, VersionConfig } from "@/api/versionApi";
import { isUpdateRequired } from "@/utils/version";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface ForceUpdateState {
  isUpdateRequired: boolean;
  config: VersionConfig | null;
  isLoading: boolean;
  error: Error | null;
  currentVersion: string;
}

export const useForceUpdate = (): ForceUpdateState => {
  const currentVersion = Constants.expoConfig?.version || "0.0.0";

  const platform = Platform.OS;
  const buildNumber =
    platform === "ios"
      ? Number(Constants.expoConfig?.ios?.buildNumber)
      : (Constants.expoConfig?.android?.versionCode ?? undefined);
  const deviceId = Constants.sessionId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["versionConfig"],
    queryFn: () =>
      fetchVersionConfig({
        appVersion: currentVersion,
        platform,
        buildNumber: Number.isFinite(buildNumber) ? buildNumber : undefined,
        deviceId,
      }),
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

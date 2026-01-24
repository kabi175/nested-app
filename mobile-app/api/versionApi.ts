import { api } from "./client";

export interface VersionConfig {
  minSupportedVersion: string;
  latestVersion: string;
  message: string;
  iosUrl: string;
  androidUrl: string;
}

export const fetchVersionConfig = async (): Promise<VersionConfig> => {
  const response = await api.get<VersionConfig>("/app/version");
  return response.data;
};

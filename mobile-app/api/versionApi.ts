import { api } from "./client";

export interface VersionConfig {
  minSupportedVersion: string;
  latestVersion: string;
  message: string;
  iosUrl: string;
  androidUrl: string;
}

export interface VersionRequestHeaders {
  appVersion: string;
  platform: string;
  buildNumber?: number;
  deviceId?: string;
}

export const fetchVersionConfig = async (
  headers: VersionRequestHeaders
): Promise<VersionConfig> => {
  const response = await api.get<VersionConfig>("/app/version", {
    headers: {
      "X-App-Version": headers.appVersion,
      "X-Platform": headers.platform,
      ...(headers.buildNumber !== undefined && {
        "X-Build-Number": headers.buildNumber,
      }),
      ...(headers.deviceId && { "X-Device-Id": headers.deviceId }),
    },
  });
  return response.data;
};

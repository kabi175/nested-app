import { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

const MFA_TOKEN_KEY = "mfa_token";
const MFA_TOKEN_EXPIRY_KEY = "mfa_token_expiry";
const MFA_ACTION_KEY = "mfa_action";
const MFA_SESSION_ID_KEY = "mfa_session_id";

export type MfaAction =
  | "MF_BUY"
  | "MF_SELL"
  | "NOMINEE_UPDATE"
  | "EMAIL_UPDATE";

export type MfaChannel = "SMS" | "WHATSAPP";

export interface StartMfaSessionResponse {
  mfaSessionId: string;
  message: string;
}

export interface VerifyOtpResponse {
  mfaToken: string;
  message: string;
}

/**
 * Start an MFA session by sending OTP to user's phone
 * @param action - The action type that requires MFA
 * @param channel - The channel to send OTP (SMS or WHATSAPP)
 * @returns Promise with session ID and message
 */
export async function startMfaSession(
  action: MfaAction,
  channel: MfaChannel = "SMS",
  api: AxiosInstance
): Promise<StartMfaSessionResponse> {
  try {
    // Call backend API to start MFA session
    const response = await api.post<StartMfaSessionResponse>(
      "/auth/mfa/start",
      {
        action,
        channel,
      }
    );

    const { mfaSessionId, message } = response.data;

    // Store session ID temporarily (will be cleared after verification)
    await SecureStore.setItemAsync(MFA_SESSION_ID_KEY, mfaSessionId);
    await SecureStore.setItemAsync(MFA_ACTION_KEY, action);

    return { mfaSessionId, message };
  } catch (error: any) {
    console.error("Error starting MFA session:", error);
    if (error.response) {
      throw new Error(
        error.response.data?.message || "Failed to start MFA session"
      );
    }
    throw error;
  }
}

/**
 * Verify OTP and get MFA token
 * @param sessionId - The MFA session ID from startMfaSession
 * @param otp - The 6-digit OTP code
 * @returns Promise with MFA token and message
 */
export async function verifyOtp(
  sessionId: string,
  otp: string,
  api: AxiosInstance
): Promise<VerifyOtpResponse> {
  try {
    // Call backend API to verify OTP
    const response = await api.post<VerifyOtpResponse>("/auth/mfa/verify", {
      mfaSessionId: sessionId,
      otp,
    });

    const { mfaToken, message } = response.data;

    // Store MFA token with expiry (5 minutes = 300 seconds)
    const expiryTime = Date.now() + 300 * 1000; // 5 minutes from now
    await SecureStore.setItemAsync(MFA_TOKEN_KEY, mfaToken);
    await SecureStore.setItemAsync(MFA_TOKEN_EXPIRY_KEY, expiryTime.toString());

    // Clear session ID after successful verification
    await SecureStore.deleteItemAsync(MFA_SESSION_ID_KEY);

    return { mfaToken, message };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400) {
        throw new Error(errorData?.message || "Invalid OTP or expired session");
      } else if (status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      } else {
        throw new Error(errorData?.message || "Failed to verify OTP");
      }
    }
    throw error;
  }
}

/**
 * Get the current MFA token if it exists and is not expired
 * @returns Promise with MFA token or null if not available/expired
 */
export async function getMfaToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(MFA_TOKEN_KEY);
    const expiryStr = await SecureStore.getItemAsync(MFA_TOKEN_EXPIRY_KEY);
    const action = await SecureStore.getItemAsync(MFA_ACTION_KEY);

    if (!token || !expiryStr || !action) {
      return null;
    }

    const expiryTime = parseInt(expiryStr, 10);
    const now = Date.now();

    // Check if token is expired
    if (now >= expiryTime) {
      // Clear expired token
      await clearMfaToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting MFA token:", error);
    return null;
  }
}

/**
 * Get the current MFA action
 * @returns Promise with action or null if not set
 */
export async function getCurrentAction(): Promise<MfaAction | null> {
  try {
    const action = await SecureStore.getItemAsync(MFA_ACTION_KEY);
    return action as MfaAction | null;
  } catch (error) {
    console.error("Error getting current action:", error);
    return null;
  }
}

/**
 * Set the current MFA action
 * @param action - The action to set
 */
export async function setCurrentAction(action: MfaAction): Promise<void> {
  try {
    await SecureStore.setItemAsync(MFA_ACTION_KEY, action);
  } catch (error) {
    console.error("Error setting current action:", error);
  }
}

/**
 * Clear the MFA token and related data
 */
export async function clearMfaToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(MFA_TOKEN_KEY);
    await SecureStore.deleteItemAsync(MFA_TOKEN_EXPIRY_KEY);
    await SecureStore.deleteItemAsync(MFA_ACTION_KEY);
    await SecureStore.deleteItemAsync(MFA_SESSION_ID_KEY);
  } catch (error) {
    console.error("Error clearing MFA token:", error);
  }
}

/**
 * Get the stored session ID (if available)
 * @returns Promise with session ID or null
 */
export async function getStoredSessionId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(MFA_SESSION_ID_KEY);
  } catch (error) {
    console.error("Error getting stored session ID:", error);
    return null;
  }
}

/**
 * Check if MFA token is expired
 * @returns Promise with boolean indicating if token is expired
 */
export async function isMfaTokenExpired(): Promise<boolean> {
  try {
    const expiryStr = await SecureStore.getItemAsync(MFA_TOKEN_EXPIRY_KEY);
    if (!expiryStr) {
      return true;
    }

    const expiryTime = parseInt(expiryStr, 10);
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error("Error checking MFA token expiry:", error);
    return true;
  }
}

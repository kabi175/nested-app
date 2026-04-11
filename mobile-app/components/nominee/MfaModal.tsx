import { mfaStateAtom } from "@/atoms/nominee";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import {
  setCurrentAction,
  startMfaSession,
  verifyOtp,
  type MfaAction,
} from "@/services/mfaService";
import { Spinner, Text } from "@ui-kitten/components";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface MfaModalProps {
  visible: boolean;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  action: "add" | "edit" | "optOut" | "save";
}

/**
 * MFA Bottom-Sheet Modal
 * Handles OTP verification before nominee mutations
 */
export function MfaModal({
  visible,
  onVerify,
  onCancel,
  action,
}: MfaModalProps) {
  const api = useAuthAxios();
  const [otp, setOtp] = useState("");
  const [mfaState, setMfaState] = useAtom(mfaStateAtom);
  const [error, setError] = useState<string | null>(null);
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-send OTP when modal becomes visible
  useEffect(() => {
    if (visible && !mfaSessionId && !isLoading) {
      sendOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      const mfaAction: MfaAction = "NOMINEE_UPDATE";
      await setCurrentAction(mfaAction);
      const response = await startMfaSession(mfaAction, "SMS", api);
      setMfaSessionId(response.mfaSessionId);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      setMfaState("failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
  };

  const handleOtpComplete = async (value: string) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!mfaSessionId) {
      setError("Session not initialized. Please try again.");
      return;
    }

    setMfaState("verifying");
    setError(null);

    try {
      await verifyOtp(mfaSessionId, otp, api);
      setMfaState("success");
      await onVerify(otp);
      // Reset on success
      setOtp("");
      setMfaSessionId(null);
      setMfaState("idle");
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setMfaState("failed");
      setError(err.message || "Invalid OTP. Please try again.");
    }
  };

  const handleCancel = () => {
    setOtp("");
    setError(null);
    setMfaSessionId(null);
    setMfaState("idle");
    onCancel();
  };

  const isVerifying = mfaState === "verifying";
  const buttonLabel = action === "optOut" ? "Verify & Opt out" : "Verify & Save";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Title */}
          <Text style={styles.title}>Enter OTP</Text>

          {/* OTP boxes */}
          <View style={styles.otpContainer}>
            {isLoading ? (
              <View style={styles.loadingRow}>
                <Spinner size="small" status="primary" />
                <Text style={styles.loadingText}>Sending verification code...</Text>
              </View>
            ) : (
              <OtpInput
                length={6}
                onComplete={handleOtpComplete}
                onChange={handleOtpChange}
                disabled={isVerifying}
              />
            )}
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We&apos;ve sent you a 6-digit code to your registered mobile number.
          </Text>

          {/* Error */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Primary button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!mfaSessionId || otp.length !== 6 || isVerifying || isLoading) &&
                styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={!mfaSessionId || otp.length !== 6 || isVerifying || isLoading}
            activeOpacity={0.8}
          >
            {isVerifying ? (
              <Spinner size="small" status="control" />
            ) : null}
            <Text style={styles.buttonText}>
              {isVerifying ? "Verifying..." : buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  otpContainer: {
    alignItems: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: "#C7D2FE",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

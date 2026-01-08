import { mfaStateAtom } from "@/atoms/nominee";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import {
  setCurrentAction,
  startMfaSession,
  verifyOtp,
  type MfaAction,
} from "@/services/mfaService";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useAtom } from "jotai";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface MfaModalProps {
  visible: boolean;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  action: "add" | "edit" | "optOut";
}

/**
 * MFA Modal Component
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
      // Set action for nominee verification
      const mfaAction: MfaAction = "NOMINEE_UPDATE";
      await setCurrentAction(mfaAction);

      // Start MFA session
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
    await handleVerify(value);
  };

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;
    if (otpToVerify.length !== 6) {
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
      // Verify OTP with custom MFA service
      await verifyOtp(mfaSessionId, otpToVerify, api);

      // If verification successful, call onVerify callback
      setMfaState("success");
      await onVerify(otpToVerify);

      // Reset state
      setOtp("");
      setMfaSessionId(null);
      setMfaState("idle");
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setMfaState("failed");
      setError(err.message || "Invalid OTP. Please try again.");
      // Keep OTP input for retry
    }
  };

  const handleCancel = () => {
    setOtp("");
    setError(null);
    setMfaSessionId(null);
    setMfaState("idle");
    onCancel();
  };

  const getActionText = () => {
    switch (action) {
      case "add":
        return "adding a nominee";
      case "edit":
        return "editing nominee details";
      case "optOut":
        return "opting out a nominee";
      default:
        return "this action";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Layout style={styles.modalContent} level="1">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text category="h6" style={styles.title}>
                Verify OTP
              </Text>
              <Text category="s2" style={styles.subtitle}>
                OTP verification required for {getActionText()}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Loading state while sending OTP */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text category="s2" style={styles.loadingText}>
                Sending verification code...
              </Text>
            </View>
          )}

          {/* OTP Input - shown when session is created */}
          {mfaSessionId && !isLoading && (
            <View style={styles.otpContainer}>
              <OtpInput
                length={6}
                onComplete={handleOtpComplete}
                onChange={handleOtpChange}
                disabled={mfaState === "verifying"}
              />
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text category="s2" status="danger">
                {error}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, styles.cancelButton]}
              appearance="outline"
              status="basic"
              onPress={handleCancel}
              disabled={mfaState === "verifying"}
            >
              Cancel
            </Button>
            <Button
              style={[styles.button, styles.verifyButton]}
              status="primary"
              onPress={() => handleVerify()}
              disabled={
                mfaState === "verifying" ||
                otp.length !== 6 ||
                !mfaSessionId ||
                isLoading
              }
            >
              {mfaState === "verifying" ? "Verifying..." : "Verify"}
            </Button>
          </View>
        </Layout>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    marginBottom: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  otpContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: "#E5E7EB",
  },
  verifyButton: {
    backgroundColor: "#2563EB",
  },
});

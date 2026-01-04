import { OtpInput } from "@/components/ui/OtpInput";
import { mfaStateAtom } from "@/atoms/nominee";
import { Button, Layout, Text } from "@ui-kitten/components";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAtom } from "jotai";
import { api } from "@/api/client";

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
export function MfaModal({ visible, onVerify, onCancel, action }: MfaModalProps) {
  const [otp, setOtp] = useState("");
  const [mfaState, setMfaState] = useAtom(mfaStateAtom);
  const [error, setError] = useState<string | null>(null);

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

    setMfaState("verifying");
    setError(null);

    try {
      // Verify OTP with backend
      await api.post("/api/v1/users/actions/verify-otp", { otp: otpToVerify });
      
      // If verification successful, call onVerify callback
      setMfaState("success");
      await onVerify(otpToVerify);
      
      // Reset state
      setOtp("");
      setMfaState("idle");
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setMfaState("failed");
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
      // Keep OTP input for retry
    }
  };

  const handleCancel = () => {
    setOtp("");
    setError(null);
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

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OtpInput
              length={6}
              onComplete={handleOtpComplete}
              onChange={handleOtpChange}
              disabled={mfaState === "verifying"}
            />
          </View>

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
              disabled={mfaState === "verifying" || otp.length !== 6}
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


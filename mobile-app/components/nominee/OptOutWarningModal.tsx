import { Button, Layout, Text } from "@ui-kitten/components";
import { AlertTriangle, X } from "lucide-react-native";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface OptOutWarningModalProps {
  visible: boolean;
  nomineeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Opt-Out Warning Modal
 * Displays warning before opting out a nominee
 */
export function OptOutWarningModal({
  visible,
  nomineeName,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: OptOutWarningModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Layout style={styles.modalContent} level="1">
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={32} color="#F59E0B" />
            </View>
          </View>

          {/* Title */}
          <Text category="h6" style={styles.title}>
            Opt Out Nominee?
          </Text>

          {/* Message */}
          <Text category="s1" style={styles.message}>
            Opting out nominees requires OTP verification.
          </Text>

          <Text category="p2" style={styles.details}>
            Are you sure you want to opt out {nomineeName}? This action requires
            MFA verification.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, styles.cancelButton]}
              appearance="outline"
              status="basic"
              onPress={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              style={[styles.button, styles.confirmButton]}
              status="warning"
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
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
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  details: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
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
  confirmButton: {
    backgroundColor: "#F59E0B",
  },
});


import { SipOrder } from "@/api/orders";
import { formatCurrency } from "@/utils/formatters";
import { Button, Layout, Text } from "@ui-kitten/components";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";

interface CancelSipModalProps {
  visible: boolean;
  sipOrder: SipOrder | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CancelSipModal({
  visible,
  sipOrder,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: CancelSipModalProps) {
  if (!sipOrder) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Layout style={styles.modalContent} level="1">
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <AlertCircle size={32} color="#EF4444" />
            </View>
          </View>

          <Text category="h6" style={styles.title}>
            Cancel SIP?
          </Text>

          <Text category="s1" style={styles.message}>
            Are you sure you want to cancel this SIP? Future installments will stop.
          </Text>

          <Text category="p2" style={styles.warningText}>
            {sipOrder.fund_name} —{" "}
            <Text style={styles.boldText}>{formatCurrency(sipOrder.amount)}</Text> per installment
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, styles.keepButton]}
              appearance="outline"
              status="basic"
              onPress={onCancel}
              disabled={isSubmitting}
            >
              Keep SIP
            </Button>
            <Button
              style={styles.button}
              status="danger"
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Cancelling..." : "Cancel SIP"}
              </Text>
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
    backgroundColor: "#FEE2E2",
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
    lineHeight: 24,
  },
  warningText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
    color: "#1F2937",
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    width: "100%",
    borderRadius: 12,
  },
  keepButton: {
    borderColor: "#E5E7EB",
  },
  buttonText: {
    color: "#FFFFFF",
  },
});

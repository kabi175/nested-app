import { Goal } from "@/types/investment";
import { formatCurrency } from "@/utils/formatters";
import { Button, Layout, Text } from "@ui-kitten/components";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";

interface DeleteGoalModalProps {
    visible: boolean;
    goal: Goal | null;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

/**
 * Delete Goal Modal
 * Displays confirmation dialog before deleting a goal
 */
export function DeleteGoalModal({
    visible,
    goal,
    onConfirm,
    onCancel,
    isSubmitting = false,
}: DeleteGoalModalProps) {
    if (!goal) return null;

    const investmentAmount = goal.investedAmount || 0;

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
                            <AlertCircle size={32} color="#EF4444" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text category="h6" style={styles.title}>
                        Delete Goal?
                    </Text>

                    {/* Message */}
                    <Text category="s1" style={styles.message}>
                        Are you sure you want to delete this goal? This action cannot be undone.
                    </Text>

                    {investmentAmount > 0 && (
                        <Text category="p2" style={styles.warningText}>
                            Your investment of{" "}
                            <Text style={styles.boldText}>{formatCurrency(investmentAmount)}</Text>{" "}
                            will be lost.
                        </Text>
                    )}

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
                            style={[styles.button]}
                            status="danger"
                            onPress={onConfirm}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? "Processing..." : "Confirm Delete"}
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
    boldText: {
        fontWeight: "700",
        color: "#1F2937",
    },
    warningText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: "column",
        gap: 12,
    },
    button: {
        width: "100%",
        borderRadius: 12,
    },
    cancelButton: {
        borderColor: "#E5E7EB",
    },
    buttonText: {
        color: "#FFFFFF",
    },
});

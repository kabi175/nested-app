import { Goal } from "@/types/investment";
import { formatCurrency } from "@/utils/formatters";
import { Button, Layout, Text } from "@ui-kitten/components";
import { AlertCircle } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { SearchableDropdown } from "../ui/SearchableDropdown";

interface DeleteGoalModalProps {
    visible: boolean;
    goal: Goal | null;
    availableGoals: Goal[];
    onConfirm: (transferToGoalId: string) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

/**
 * Delete Goal Modal
 * Displays confirmation dialog before deleting a goal with transfer option
 */
export function DeleteGoalModal({
    visible,
    goal,
    availableGoals,
    onConfirm,
    onCancel,
    isSubmitting = false,
}: DeleteGoalModalProps) {
    const [selectedTransferGoal, setSelectedTransferGoal] = useState<Goal | null>(
        null
    );

    // Filter out the current goal and prepare dropdown data
    const transferGoalOptions = useMemo(() => {
        if (!goal) return [];
        return availableGoals
            .filter((g) => g.id !== goal.id && g.status === "active")
            .map((g) => ({
                id: g.id,
                label: `${g.title} - ${formatCurrency(g.targetAmount)}`,
                goal: g,
            }));
    }, [availableGoals, goal]);

    // Reset selected goal when modal closes
    React.useEffect(() => {
        if (!visible) {
            setSelectedTransferGoal(null);
        }
    }, [visible]);

    const handleConfirm = () => {
        if (selectedTransferGoal) {
            onConfirm(selectedTransferGoal.id);
        }
    };

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
                        Your investment of{" "}
                        <Text style={styles.boldText}>{formatCurrency(investmentAmount)}</Text>{" "}
                        will be transferred to another goal.
                    </Text>

                    <Text category="p2" style={styles.warningText}>
                        This action cannot be undone.
                    </Text>

                    {/* Transfer Goal Selection */}
                    <View style={styles.transferSection}>
                        <Text category="s1" style={styles.transferLabel}>
                            Transfer to Goal <Text style={styles.required}>*</Text>
                        </Text>
                        <SearchableDropdown
                            data={transferGoalOptions}
                            labelKey="label"
                            valueKey="id"
                            placeholder="Select a goal"
                            onSelect={(item: { id: string; label: string; goal: Goal }) =>
                                setSelectedTransferGoal(item.goal)
                            }
                            selectedValue={
                                selectedTransferGoal
                                    ? transferGoalOptions.find(
                                        (opt) => opt.goal.id === selectedTransferGoal.id
                                    ) || null
                                    : null
                            }
                            disabled={isSubmitting}
                        />
                    </View>

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
                            onPress={handleConfirm}
                            disabled={isSubmitting || !selectedTransferGoal}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? "Processing..." : "Confirm Delete & Transfer"}
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
    transferSection: {
        marginBottom: 24,
    },
    transferLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
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

import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { DeleteGoalModal } from "@/components/goal/DeleteGoalModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { useGoal } from "@/hooks/useGoal";
import { usePendingOrdersByGoalId } from "@/hooks/usePendingOrders";
import { formatCurrency } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import { ArrowLeft, CreditCard, Edit, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DraftGoalScreen() {
    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goal, isLoading: goalLoading } = useGoal(goal_id);
    const { data: pendingOrders, isLoading: ordersLoading } =
        usePendingOrdersByGoalId(goal_id);
    const setCart = useSetAtom(cartAtom);
    const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);
    const deleteGoalMutation = useDeleteGoal();
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const hasPendingOrders = pendingOrders && pendingOrders.length > 0;

    const isLoading = goalLoading || ordersLoading;

    const handleContinuePayment = () => {
        if (pendingOrders && pendingOrders.length > 0) {
            setCart(pendingOrders);
            router.replace("/child/1/goal/suggestions");
        }
    };

    const handleStartNewPayment = () => {
        if (goal) {
            setGoalsForCustomize([goal]);
            router.push({
                pathname: `/child/${goal.childId}/goal/customize`,
                params: {
                    goal_id: goal.id,
                    target_amount: goal.targetAmount.toString(),
                    target_date: goal.targetDate.toISOString(),
                },
            });
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteGoalMutation.mutateAsync({
                goalId: goal_id,
            });
            setShowDeleteModal(false);
            router.replace("/child");
        } catch (error) {
            console.error("Error deleting goal:", error);
            Alert.alert(
                "Error",
                "Failed to delete goal. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.replace("/child")}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Draft Goal</ThemedText>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (!goal) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.replace("/child")}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Draft Goal</ThemedText>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Goal not found</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Calculate total pending amount
    const totalPendingAmount = pendingOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.replace("/child")}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Draft Goal</ThemedText>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Goal Info Card */}
                <ThemedView style={styles.goalCard}>
                    <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                    <View style={styles.goalInfoRow}>
                        <View style={styles.goalInfoItem}>
                            <ThemedText style={styles.goalInfoLabel}>Target Amount</ThemedText>
                            <ThemedText style={styles.goalInfoValue}>
                                {formatCurrency(goal.targetAmount)}
                            </ThemedText>
                        </View>
                        <View style={styles.goalInfoItem}>
                            <ThemedText style={styles.goalInfoLabel}>Target Date</ThemedText>
                            <ThemedText style={styles.goalInfoValue}>
                                {goal.targetDate.toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </ThemedText>
                        </View>
                    </View>
                </ThemedView>

                {/* Pending Orders Info */}
                {hasPendingOrders && (
                    <ThemedView style={styles.pendingOrdersCard}>
                        <View style={styles.pendingOrdersHeader}>
                            <ThemedText style={styles.pendingOrdersTitle}>
                                Pending Payment
                            </ThemedText>
                            <View style={styles.pendingBadge}>
                                <ThemedText style={styles.pendingBadgeText}>
                                    {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""}
                                </ThemedText>
                            </View>
                        </View>
                        <ThemedText style={styles.pendingOrdersAmount}>
                            {formatCurrency(totalPendingAmount)}
                        </ThemedText>
                        <ThemedText style={styles.pendingOrdersDescription}>
                            You have a pending payment for this goal. You can continue with the
                            previous payment or start a new one.
                        </ThemedText>
                    </ThemedView>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {hasPendingOrders && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.continueButton]}
                            onPress={handleContinuePayment}
                        >
                            <CreditCard size={20} color="#FFFFFF" />
                            <ThemedText style={styles.actionButtonText}>
                                Continue Previous Payment
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            hasPendingOrders ? styles.newPaymentButton : styles.primaryButton,
                        ]}
                        onPress={handleStartNewPayment}
                    >
                        <Plus size={20} color="#FFFFFF" />
                        <ThemedText style={styles.actionButtonText}>
                            {hasPendingOrders ? "Start New Payment" : "Start Payment"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Edit and Delete Goal Section */}
                {goal &&
                    (goal.status === "draft" || goal.status === "payment_pending") && (
                        <View style={styles.editDeleteSection}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.push(`/goal/${goal_id}/edit`)}
                            >
                                <Edit size={18} color="#3B82F6" />
                                <ThemedText style={styles.editButtonText}>Edit Goal</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={18} color="#EF4444" />
                                <ThemedText style={styles.deleteButtonText}>Delete Goal</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
            </ScrollView>

            {/* Delete Goal Modal */}
            <DeleteGoalModal
                visible={showDeleteModal}
                goal={goal}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
                isSubmitting={deleteGoalMutation.isPending}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
        textAlign: "center",
    },
    goalCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
    },
    goalInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    goalInfoItem: {
        flex: 1,
    },
    goalInfoLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 4,
    },
    goalInfoValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    pendingOrdersCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "#FEF3C7",
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    pendingOrdersHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    pendingOrdersTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#92400E",
    },
    pendingBadge: {
        backgroundColor: "#FCD34D",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pendingBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#92400E",
    },
    pendingOrdersAmount: {
        fontSize: 24,
        fontWeight: "700",
        color: "#92400E",
        marginBottom: 8,
    },
    pendingOrdersDescription: {
        fontSize: 14,
        color: "#78350F",
        lineHeight: 20,
    },
    actionsContainer: {
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    continueButton: {
        backgroundColor: "#3B82F6",
    },
    newPaymentButton: {
        backgroundColor: "#10B981",
    },
    primaryButton: {
        backgroundColor: "#3B82F6",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    editDeleteSection: {
        marginTop: 8,
        gap: 12,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DBEAFE",
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#3B82F6",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#FEE2E2",
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
    },
});

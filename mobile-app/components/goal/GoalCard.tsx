import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { Goal } from "@/types/investment";
import { formatCurrency } from "@/utils/formatters";
import { useTheme } from "@react-navigation/native";
import { ProgressBar } from "@ui-kitten/components";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { GraduationCap, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface GoalCardProps {
  goal: Goal;
}

// Removed unused getStatusColor function

function timeRemaining(future: Date) {
  const now = new Date();

  if (future <= now) return "Expired";

  const diffInMs = future.getTime() - now.getTime();
  const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365.25));

  if (diffInYears > 1) {
    return `${Math.floor(diffInYears)} years remaining`;
  } else if (diffInYears === 1) {
    return `1 year remaining`;
  }

  const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30.44));
  if (diffInMonths > 1) {
    return `${diffInMonths} months remaining`;
  } else if (diffInMonths === 1) {
    return `1 month remaining`;
  }

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays > 1) {
    return `${diffInDays} days remaining`;
  }
  return `1 day remaining`;
}

export function GoalCard({ goal }: GoalCardProps) {
  const setCart = useSetAtom(cartAtom);
  const progressPercentage = goal.currentAmount / goal.targetAmount;
  const theme = useTheme();

  const handleGoalPress = async () => {
    if (goal.status === "draft") {
      router.push({
        pathname: `/child/${goal.childId}/goal/${goal.id}/customize`,
        params: {
          goal_id: goal.id,
          target_amount: goal.targetAmount.toString(),
          target_date: goal.targetDate.toISOString(),
        },
      });
    } else if (goal.status === "payment_pending") {
      const orders = await getPendingOrdersByGoalId(goal.id);
      if (orders.length > 0) {
        setCart(orders);

        router.push({
          pathname: `/payment`,
        });
      }
    }
  };

  return (
    <TouchableOpacity onPress={handleGoalPress}>
      <ThemedView style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={[styles.goalIcon]}>
            <GraduationCap color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.goalContent}>
            <View style={styles.goalTitleContainer}>
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              {["draft", "payment_pending"].includes(goal.status) && (
                <View style={styles.draftBadge}>
                  <ThemedText style={styles.draftText}>
                    {goal.status === "draft"
                      ? "SIP Setup Pending"
                      : "Payment Pending"}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.timeRemainingContainer}>
              <TrendingUp color="#6B7280" size={16} />
              <ThemedText style={styles.timeRemaining}>
                {timeRemaining(goal.targetDate)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressAmounts}>
            <ThemedText style={styles.progressAmount}>
              {formatCurrency(goal.currentAmount)}
            </ThemedText>
            <ThemedText style={styles.progressAmount}>
              {formatCurrency(goal.targetAmount)}
            </ThemedText>
          </View>
          <ProgressBar progress={progressPercentage} style={[]} />
          <View style={styles.progressInfo}>
            <ThemedText style={styles.completionPercentage}>
              {(progressPercentage * 100).toFixed(1)}% Complete
            </ThemedText>
            {goal.monthlySip && (
              <ThemedText style={styles.monthlySip}>
                Monthly SIP:{" "}
                <ThemedText style={styles.monthlySipAmount}>
                  {formatCurrency(goal.monthlySip)}
                </ThemedText>
              </ThemedText>
            )}
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "#FFFFFF",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#3b82f620",
  },
  goalContent: {
    flex: 1,
  },
  goalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  draftBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  draftText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timeRemainingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeRemaining: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  goalProgress: {
    marginTop: 5,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  completionPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  monthlySip: {
    fontSize: 12,
    color: "#3B82F6",
  },
  monthlySipAmount: {
    fontSize: 12,
    color: "#3B82F6",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});

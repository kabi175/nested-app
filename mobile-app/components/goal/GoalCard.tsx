import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import type { Goal } from "@/types/investment";
import { formatCurrency } from "@/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "@ui-kitten/components";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { TrendingUp } from "lucide-react-native";
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

// Generate a color for the left border based on goal ID
function getGoalBorderColor(goalId: string): string {
  const colors = ["#FBCFE8", "#FEF3C7", "#FCE7F3", "#DBEAFE", "#D1FAE5"];
  const hash = goalId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function GoalCard({ goal }: GoalCardProps) {
  const api = useAuthAxios();
  const queryClient = useQueryClient();
  const setCart = useSetAtom(cartAtom);
  const progressPercentage = goal.currentAmount / goal.targetAmount;
  const borderColor = getGoalBorderColor(goal.id);
  const hasMonthlySip =
    typeof goal.monthlySip === "number" &&
    goal.monthlySip !== null &&
    goal.monthlySip > 0;
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);

  const handleGoalPress = async () => {
    if (goal.status === "draft") {
      setGoalsForCustomize([goal]);
      router.push({
        pathname: `/child/${goal.childId}/goal/customize`,
        params: {
          goal_id: goal.id,
          target_amount: goal.targetAmount.toString(),
          target_date: goal.targetDate.toISOString(),
        },
      });
    } else if (goal.status === "payment_pending") {
      const orders = await queryClient.fetchQuery({
        queryKey: [QUERY_KEYS.pendingOrders, goal.id],
        queryFn: () => getPendingOrdersByGoalId(api, goal.id),
      });
      if (orders.length > 0) {
        setCart(orders);

        router.push({
          pathname: `/payment`,
        });
      } else {
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
    } else {
      router.push({
        pathname: `/goal/${goal.id}`,
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleGoalPress}>
      <ThemedView
        style={[
          styles.goalCard,
          { borderLeftColor: borderColor, borderLeftWidth: 4 },
        ]}
      >
        <View style={styles.goalHeader}>
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
              <TrendingUp color="#6B7280" size={14} />
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
            {progressPercentage > 0 && (
              <ThemedText style={styles.completionPercentage}>
                {(progressPercentage * 100).toFixed(1)}% Complete
              </ThemedText>
            )}
            {hasMonthlySip && (
              <ThemedText style={styles.monthlySip}>
                Monthly SIP:{" "}
                <ThemedText style={styles.monthlySipAmount}>
                  {formatCurrency(goal.monthlySip ?? 0)}
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
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#FFFFFF",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#3b82f620",
  },
  goalContent: {
    flex: 1,
  },
  goalTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  draftBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  draftText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timeRemainingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeRemaining: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },
  goalProgress: {
    marginTop: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  progressAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  completionPercentage: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
  },
  monthlySip: {
    fontSize: 11,
    color: "#3B82F6",
  },
  monthlySipAmount: {
    fontSize: 11,
    color: "#3B82F6",
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});

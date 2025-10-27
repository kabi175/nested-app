import { GoalForCustomize, goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAtom } from "jotai";
import {
  Calendar,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CustomizeGoalCardProps {
  goal: GoalForCustomize;
}

function CustomizeGoalCard({ goal }: CustomizeGoalCardProps) {
  // Get investment amounts from goal data
  const sipInvestment = goal.investment?.find((inv) => inv.type === "sip");
  const lumpSumInvestment = goal.investment?.find((inv) => inv.type === "buy");

  const displaySipAmount = sipInvestment?.amount || 0;
  const displayLumpSumAmount = lumpSumInvestment?.amount || 0;

  const handleGoalPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: `/child/${goal.childId}/goal/${goal.id}/customize`,
      params: {
        target_amount: goal.targetAmount.toString(),
        target_date: goal.targetDate.toISOString(),
      },
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const timeRemaining = (future: Date) => {
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
  };

  return (
    <TouchableOpacity onPress={handleGoalPress} style={styles.goalCard}>
      <ThemedView style={styles.cardContent}>
        {/* Header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalIcon}>
            <GraduationCap color="#2563EB" size={24} />
          </View>
          <View style={styles.goalContent}>
            <View style={styles.goalTitleContainer}>
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              {goal.status === "draft" && (
                <View style={styles.draftBadge}>
                  <ThemedText style={styles.draftText}>
                    Setup Pending
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={styles.timeRemainingContainer}>
              <Calendar color="#6B7280" size={14} />
              <ThemedText style={styles.timeRemaining}>
                {timeRemaining(goal.targetDate)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Target Amount */}
        <View style={styles.targetAmountContainer}>
          <View style={styles.targetAmountRow}>
            <Target color="#6B7280" size={16} />
            <ThemedText style={styles.targetAmountLabel}>
              Target Amount
            </ThemedText>
          </View>
          <ThemedText style={styles.targetAmount}>
            {formatCurrency(goal.targetAmount)}
          </ThemedText>
        </View>

        {/* Investment Details */}
        <View style={styles.investmentDetails}>
          <View style={styles.investmentRow}>
            <View style={styles.investmentItem}>
              <TrendingUp color="#10B981" size={16} />
              <ThemedText style={styles.investmentLabel}>
                Monthly SIP
                {sipInvestment ? (
                  <ThemedText style={styles.configuredBadge}> ✓</ThemedText>
                ) : (
                  <ThemedText style={styles.notConfiguredBadge}>
                    {" "}
                    Not Set
                  </ThemedText>
                )}
              </ThemedText>
              <ThemedText style={styles.investmentAmount}>
                {displaySipAmount > 0
                  ? formatCurrency(displaySipAmount)
                  : "Not configured"}
              </ThemedText>
            </View>
            <View style={styles.investmentItem}>
              <Ionicons name="cash-outline" size={16} color="#F59E0B" />
              <ThemedText style={styles.investmentLabel}>
                Lump Sum
                {lumpSumInvestment ? (
                  <ThemedText style={styles.configuredBadge}> ✓</ThemedText>
                ) : (
                  <ThemedText style={styles.notConfiguredBadge}>
                    {" "}
                    Not Set
                  </ThemedText>
                )}
              </ThemedText>
              <ThemedText style={styles.investmentAmount}>
                {displayLumpSumAmount > 0
                  ? formatCurrency(displayLumpSumAmount)
                  : "Not configured"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Target Date */}
        <View style={styles.targetDateContainer}>
          <ThemedText style={styles.targetDateLabel}>Target Date</ThemedText>
          <ThemedText style={styles.targetDate}>
            {formatDate(goal.targetDate)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function CustomizeGoalScreen() {
  const [childGoals] = useAtom(goalsForCustomizeAtom);

  if (childGoals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <GraduationCap color="#9CA3AF" size={48} />
          <ThemedText style={styles.emptyTitle}>No Goals Found</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Create goals for this child to customize investments
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={styles.animatedContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Customize Investments
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Select a goal to customize your investment plan
            </ThemedText>
          </View>
        </View>

        {/* Goals List */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {childGoals.map((goal) => (
            <CustomizeGoalCard key={goal.id} goal={goal} />
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  animatedContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  goalCard: {
    marginBottom: 16,
  },
  cardContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
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
  targetAmountContainer: {
    marginBottom: 16,
  },
  targetAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  targetAmountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  targetAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  investmentDetails: {
    marginBottom: 16,
  },
  investmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  investmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  investmentLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  investmentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  configuredBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  notConfiguredBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  targetDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  targetDateLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  targetDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

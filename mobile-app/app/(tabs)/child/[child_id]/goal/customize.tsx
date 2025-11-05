import { GoalForCustomize, goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAtom } from "jotai";
import {
  AlertCircle,
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

  const handleCompleteSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGoalPress();
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

  // Extract short title (PG, UG, etc.)
  const getShortTitle = (title: string) => {
    if (
      title.toLowerCase().includes("postgraduate") ||
      title.toLowerCase().includes("post-graduate")
    ) {
      return "PG";
    }
    if (title.toLowerCase().includes("undergraduate")) {
      return "UG";
    }
    // Return first 2 uppercase letters or first 2 characters
    const words = title.split(" ");
    if (words.length > 1) {
      return words
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  // Draft state design matching the image
  if (goal.status === "draft") {
    return (
      <View style={styles.goalCard}>
        <ThemedView style={styles.cardContent}>
          {/* Goal Header Section */}
          <View style={styles.goalHeader}>
            <View style={styles.goalHeaderLeft}>
              <View style={styles.goalIcon}>
                <GraduationCap color="#FFFFFF" size={24} strokeWidth={2} />
              </View>
              <View style={styles.goalTitleContainer}>
                <ThemedText style={styles.goalTitleShort}>
                  {getShortTitle(goal.title)}
                </ThemedText>
                <View style={styles.timeRemainingContainer}>
                  <Calendar color="#6B7280" size={12} />
                  <ThemedText style={styles.timeRemaining}>
                    {timeRemaining(goal.targetDate)}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.draftBadge}>
              <ThemedText style={styles.draftText}>Setup Pending</ThemedText>
            </View>
          </View>

          {/* Target Amount Section */}
          <View style={styles.targetAmountContainer}>
            <View style={styles.targetAmountRow}>
              <View style={styles.purpleBullet} />
              <ThemedText style={styles.targetAmountLabel}>
                Target Amount
              </ThemedText>
            </View>
            <ThemedText style={styles.targetAmount}>
              {formatCurrency(goal.targetAmount)}
            </ThemedText>
          </View>

          {/* Warning/Instruction Message */}
          <View style={styles.warningBox}>
            <View style={styles.warningIconContainer}>
              <AlertCircle color="#FFFFFF" size={20} />
            </View>
            <ThemedText style={styles.warningText}>
              Complete setup to start investing towards your goal
            </ThemedText>
          </View>

          {/* Complete Setup Button */}
          <TouchableOpacity
            style={styles.completeSetupButton}
            onPress={handleCompleteSetup}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2563EB", "#9333EA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeSetupGradient}
            >
              <ThemedText style={styles.completeSetupText}>
                Complete Setup
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </View>
    );
  }

  // Non-draft state - keep original design with improvements
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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  goalHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#2563EB",
  },
  goalContent: {
    flex: 1,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  goalTitleShort: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  draftBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  draftText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  timeRemainingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
  purpleBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9333EA",
    marginRight: 8,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
  },
  completeSetupButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  completeSetupGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  completeSetupText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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

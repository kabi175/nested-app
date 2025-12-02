import { Holding, Transaction } from "@/api/portfolioAPI";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGoal } from "@/hooks/useGoal";
import {
  usePortfolioHoldings,
  usePortfolioTransactions,
} from "@/hooks/usePortfolio";
import { formatCurrency } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import {
  ArrowLeft,
  MoreVertical,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FundDetailScreen() {
  const { goal_id, fund_id } = useLocalSearchParams<{
    goal_id: string;
    fund_id: string;
  }>();

  const { data: goal } = useGoal(goal_id);
  const { data: holdings, isLoading: holdingsLoading } =
    usePortfolioHoldings(goal_id);
  const { data: transactions, isLoading: transactionsLoading } =
    usePortfolioTransactions(goal_id, 0);
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);

  const fundData = useMemo(() => {
    if (!holdings || !fund_id) return null;

    // Find the specific fund holding
    const holding = holdings.find((h: Holding) => h.fund === fund_id);
    if (!holding) return null;

    // Calculate units from transactions
    let totalUnits = 0;
    let totalInvestedForNav = 0;
    let totalUnitsForNav = 0;

    if (transactions) {
      const fundTransactions = transactions.filter(
        (t: Transaction) => t.fund === fund_id && t.status === "completed"
      );

      fundTransactions.forEach((t: Transaction) => {
        if (t.type === "BUY") {
          totalUnits += t.units;
          totalInvestedForNav += t.amount;
          totalUnitsForNav += t.units;
        } else if (t.type === "SELL") {
          totalUnits -= t.units;
        }
      });
    }

    // Calculate NAV values
    const currentNav = totalUnits > 0 ? holding.current_value / totalUnits : 0;
    const averageNav =
      totalUnitsForNav > 0 ? totalInvestedForNav / totalUnitsForNav : 0;

    // If we couldn't calculate units from transactions, estimate from holding data
    const finalUnits =
      totalUnits > 0
        ? totalUnits
        : averageNav > 0
        ? holding.invested_amount / averageNav
        : holding.current_value / currentNav || 0;

    // Recalculate NAV with final units if needed
    const finalCurrentNav =
      finalUnits > 0 ? holding.current_value / finalUnits : currentNav;
    const finalAverageNav =
      finalUnits > 0 ? holding.invested_amount / finalUnits : averageNav;

    // Calculate returns percentage
    const returnsPercentage =
      holding.invested_amount > 0
        ? (holding.returns_amount / holding.invested_amount) * 100
        : 0;

    // Get current date for NAV date (format: DD-MM-YY)
    const navDate = new Date();
    const day = String(navDate.getDate()).padStart(2, "0");
    const month = String(navDate.getMonth() + 1).padStart(2, "0");
    const year = String(navDate.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;

    return {
      holding,
      units: finalUnits,
      currentNav: finalCurrentNav,
      averageNav: finalAverageNav,
      returnsPercentage,
      navDate: formattedDate,
    };
  }, [holdings, transactions, fund_id]);

  const isLoading = holdingsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {fund_id || "Fund"}
          </ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!fundData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {fund_id || "Fund"}
          </ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Fund not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const { holding, units, currentNav, averageNav, returnsPercentage, navDate } =
    fundData;
  const isPositive = holding.returns_amount >= 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{holding.fund}</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Card */}
        <ThemedView style={styles.mainCard}>
          {/* Profit/Loss Section */}
          <View style={styles.profitLossSection}>
            {isPositive ? (
              <TrendingUp size={24} color="#10B981" />
            ) : (
              <TrendingDown size={24} color="#EF4444" />
            )}
            <ThemedText
              style={[
                styles.profitLossAmount,
                !isPositive && styles.profitLossAmountNegative,
              ]}
            >
              {isPositive ? "+" : "-"}
              {formatCurrency(Math.abs(holding.returns_amount))}
            </ThemedText>
            <ThemedText
              style={[
                styles.profitLossPercentage,
                !isPositive && styles.profitLossPercentageNegative,
              ]}
            >
              {isPositive ? "+" : ""}
              {returnsPercentage.toFixed(2)}% P&L
            </ThemedText>
          </View>

          {/* Value and Investment Section */}
          <View style={styles.valueSection}>
            <View style={styles.valueColumn}>
              <ThemedText style={styles.valueLabel}>Current Value</ThemedText>
              <ThemedText style={styles.valueAmount}>
                {formatCurrency(holding.current_value)}
              </ThemedText>
            </View>
            <View style={styles.valueColumn}>
              <ThemedText style={styles.valueLabel}>Investment</ThemedText>
              <ThemedText style={styles.valueAmount}>
                {formatCurrency(holding.invested_amount)}
              </ThemedText>
            </View>
          </View>

          {/* NAV Section */}
          <View style={styles.navSection}>
            <View style={styles.navColumn}>
              <ThemedText style={styles.navLabel}>Curr. NAV</ThemedText>
              <ThemedText style={styles.navAmount}>
                ₹{currentNav.toFixed(2)}
              </ThemedText>
              <ThemedText style={styles.navDate}>as on {navDate}</ThemedText>
            </View>
            <View style={styles.navColumn}>
              <ThemedText style={styles.navLabel}>Avg. NAV</ThemedText>
              <ThemedText style={styles.navAmount}>
                ₹{averageNav.toFixed(2)}
              </ThemedText>
            </View>
          </View>

          {/* Units Section */}
          <View style={styles.unitsSection}>
            <ThemedText style={styles.unitsLabel}>Units</ThemedText>
            <ThemedText style={styles.unitsAmount}>
              {units.toFixed(2)}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.investButton}
            onPress={() => {
              if (goal == null) {
                return;
              }
              // Set the goal in the atom for customize screen
              setGoalsForCustomize([goal]);
              // Navigate to customize screen
              router.push(`/child/${goal.childId}/goal/customize`);
            }}
          >
            <ThemedText style={styles.investButtonText}>Invest</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Continue Later Link */}
        <TouchableOpacity
          style={styles.continueLaterContainer}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.continueLaterText}>
            Continue later
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  mainCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profitLossSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profitLossAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 8,
    marginBottom: 4,
  },
  profitLossAmountNegative: {
    color: "#EF4444",
  },
  profitLossPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  profitLossPercentageNegative: {
    color: "#EF4444",
  },
  valueSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  navSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navColumn: {
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  navAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  navDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  unitsSection: {
    alignItems: "center",
  },
  unitsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  unitsAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  investButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  continueLaterContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  continueLaterText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

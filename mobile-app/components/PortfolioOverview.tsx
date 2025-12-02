import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PortfolioOverviewProps {
  currentValue: number;
  invested: number;
  returns: number;
  returnsPercentage?: number;
}

export function PortfolioOverview({
  currentValue,
  invested,
  returns,
  returnsPercentage,
}: PortfolioOverviewProps) {
  // Calculate returns percentage if not provided
  const calculatedReturnsPercentage =
    returnsPercentage !== undefined
      ? returnsPercentage
      : invested > 0
      ? (returns / invested) * 100
      : 0;

  const isPositiveReturns = returns >= 0;

  return (
    <ThemedView style={styles.card}>
      {/* Top Section - Current Value */}
      <View style={styles.topSection}>
        <View style={styles.currentValueContainer}>
          <ThemedText style={styles.currentValueLabel}>
            Current Value
          </ThemedText>
          <ThemedText style={styles.currentValueAmount}>
            {formatCurrency(currentValue)}
          </ThemedText>
        </View>
      </View>

      {/* Bottom Section - Invested & Returns */}
      <View style={styles.bottomSection}>
        {/* Invested */}
        <View style={styles.investedContainer}>
          <View style={styles.iconLabelRow}>
            <PiggyBank size={20} color="#6B7280" />
            <ThemedText style={styles.label}>Invested</ThemedText>
          </View>
          <ThemedText style={styles.investedAmount}>
            {formatCurrency(invested)}
          </ThemedText>
        </View>

        {/* Returns */}
        <View style={styles.returnsContainer}>
          <View style={styles.iconLabelRow}>
            {isPositiveReturns ? (
              <TrendingUp size={20} color="#10B981" />
            ) : (
              <TrendingDown size={20} color="#EF4444" />
            )}
            <ThemedText style={styles.label}>Returns</ThemedText>
          </View>
          <ThemedText
            style={[
              styles.returnsAmount,
              !isPositiveReturns && styles.returnsAmountNegative,
            ]}
          >
            {formatCurrency(returns)} (
            {calculatedReturnsPercentage >= 0 ? "+" : ""}
            {calculatedReturnsPercentage.toFixed(1)}%)
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  walletIconContainer: {
    marginRight: 12,
  },
  currentValueContainer: {
    flex: 1,
  },
  currentValueLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  currentValueAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  investedContainer: {
    flex: 1,
  },
  returnsContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  investedAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  returnsAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  returnsAmountNegative: {
    color: "#EF4444",
  },
});

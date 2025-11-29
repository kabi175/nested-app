import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PortfolioSummaryCardProps {
  currentValue: number;
  investedAmount: number;
  returnsAmount: number;
}

export function PortfolioSummaryCard({
  currentValue,
  investedAmount,
  returnsAmount,
}: PortfolioSummaryCardProps) {
  const returnsPercentage =
    investedAmount > 0 ? (returnsAmount / investedAmount) * 100 : 0;

  return (
    <ThemedView style={styles.summaryCard}>
      <ThemedText style={styles.currentValueLabel}>Current Value</ThemedText>
      <ThemedText style={styles.currentValue}>
        {formatCurrency(currentValue)}
      </ThemedText>
      <View style={styles.bottomRow}>
        <View style={styles.investedContainer}>
          <ThemedText style={styles.investedLabel}>Invested</ThemedText>
          <ThemedText style={styles.investedAmount}>
            {formatCurrency(investedAmount)}
          </ThemedText>
        </View>
        <View style={styles.returnsContainer}>
          <ThemedText style={styles.returnsLabel}>Returns</ThemedText>
          <View style={styles.returnsRow}>
            <TrendingUp color="#10B981" size={16} />
            <ThemedText style={styles.returnsAmount}>
              {formatCurrency(returnsAmount)}
            </ThemedText>
          </View>
          <ThemedText style={styles.returnsPercentage}>
            {returnsPercentage.toFixed(1)}%
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
  },
  currentValueLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  investedContainer: {
    flex: 1,
  },
  investedLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  investedAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  returnsContainer: {
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    alignItems: "flex-end",
  },
  returnsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  returnsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  returnsAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  returnsPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
});

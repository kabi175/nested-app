import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PortfolioSummaryCardProps {
  currentValue: number;
  invested: number;
}

export function PortfolioSummaryCard({
  currentValue,
  invested,
}: PortfolioSummaryCardProps) {
  const returns = currentValue - invested;
  const returnsPercentage =
    invested > 0 ? ((returns / invested) * 100).toFixed(2) : "0.00";

  return (
    <ThemedView style={styles.card}>
      <View style={styles.currentValueContainer}>
        <ThemedText style={styles.currentValueLabel}>Current Value</ThemedText>
        <ThemedText style={styles.currentValueAmount}>
          {formatCurrency(currentValue)}
        </ThemedText>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.investedContainer}>
          <ThemedText style={styles.label}>Invested</ThemedText>
          <ThemedText style={styles.amount}>
            {formatCurrency(invested)}
          </ThemedText>
        </View>
        <View style={styles.returnsContainer}>
          <View style={styles.returnsBox}>
            <ThemedText style={styles.returnsLabel}>Returns</ThemedText>
            <View style={styles.returnsContent}>
              <View style={styles.returnsAmountRow}>
                <TrendingUp color="#10B981" size={16} strokeWidth={2.5} />
                <ThemedText style={styles.returnsAmount}>
                  {formatCurrency(Math.abs(returns))}
                </ThemedText>
              </View>
              <ThemedText style={styles.returnsPercentage}>
                +{returnsPercentage}%
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  currentValueContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentValueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  currentValueAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  investedContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  returnsContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  returnsBox: {
    backgroundColor: "#E0E7FF",
    borderRadius: 10,
    padding: 12,
    minWidth: 140,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  returnsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  returnsContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  returnsAmountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnsAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
  },
  returnsPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 4,
  },
});

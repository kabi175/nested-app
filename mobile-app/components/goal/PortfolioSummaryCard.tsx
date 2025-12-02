import React from "react";
import { StyleSheet } from "react-native";
import { PortfolioOverview } from "../PortfolioOverview";

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
    <PortfolioOverview
      currentValue={currentValue}
      invested={investedAmount}
      returns={returnsAmount}
      returnsPercentage={returnsPercentage}
    />
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

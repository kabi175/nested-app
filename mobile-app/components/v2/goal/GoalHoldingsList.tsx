import { Holding } from "@/api/portfolioAPI";
import { ThemedText } from "@/components/ThemedText";
import HoldingCard from "@/components/v2/HoldingCard";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface GoalHoldingsListProps {
  goalId: string;
  holdings: Holding[];
}

export default function GoalHoldingsList({ goalId, holdings }: GoalHoldingsListProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>FUND PORTFOLIO</Text>
      {holdings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No holdings found</ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {holdings.map((holding, index) => (
            <HoldingCard
              key={index}
              fund={holding.fund}
              fund_category={holding.fund_category}
              allocation_percentage={holding.allocation_percentage}
              invested_amount={holding.invested_amount}
              returns_amount={holding.returns_amount}
              onPress={() => router.push(`/goal/${goalId}/${holding.fund_id}`)}
            />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    color: "#8A8A9A",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 20,
  },
  list: {
    gap: 12,
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

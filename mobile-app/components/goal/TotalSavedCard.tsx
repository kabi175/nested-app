import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface TotalSavedCardProps {
  totalAmount: number;
}

export function TotalSavedCard({ totalAmount }: TotalSavedCardProps) {
  return (
    <ThemedView style={styles.totalSavedCard}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.label}>Total Saved</ThemedText>
        <ThemedText style={styles.amount}>
          {formatCurrency(totalAmount)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  totalSavedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
});

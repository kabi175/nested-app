import { formatCurrency } from "@/utils/formatters";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function formatNextSipDate(date: Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" }).toUpperCase()}`;
}

interface GoalSipCardProps {
  monthlySip: number;
  nextSipDate: Date | null;
  stepUpPercent: number;
}

export default function GoalSipCard({ monthlySip, nextSipDate, stepUpPercent }: GoalSipCardProps) {
  return (
    <View style={styles.sipCard}>
      <View style={styles.sipTopRow}>
        <Text style={styles.sipLabel}>MONTHLY SIP</Text>
        <Text style={styles.sipAmount}>{formatCurrency(monthlySip)}/mo</Text>
      </View>
      <View style={styles.sipDivider} />
      <View style={styles.sipRow}>
        <Text style={styles.sipRowLabel}>NEXT SIP</Text>
        <Text style={styles.sipRowValue}>{formatNextSipDate(nextSipDate)}</Text>
      </View>
      <View style={[styles.sipRow, { marginBottom: 0 }]}>
        <Text style={styles.sipRowLabel}>STEP-UP</Text>
        <Text style={styles.sipRowValue}>{stepUpPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sipCard: {
    backgroundColor: "#F4F4F4",
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  sipTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sipLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.3,
  },
  sipAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2848F1",
  },
  sipDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 14,
  },
  sipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sipRowLabel: {
    fontSize: 11,
    color: "#8A8A9A",
    letterSpacing: 0.5,
  },
  sipRowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});

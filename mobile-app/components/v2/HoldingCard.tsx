import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ─── Tokens ─────────────────────────────────────────────────────────────────
const T = {
  cardBg: "#F4F4F4",
  textDark: "#111111",
  textMuted: "#8A8A9A",
  positive: "#2848F1",
  negative: "#EF4444",
} as const;

// ─── Props ──────────────────────────────────────────────────────────────────
interface HoldingCardProps {
  fund: string;
  fund_category?: string;
  allocation_percentage: number;
  invested_amount: number;
  returns_amount: number;
  cagr?: string;
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function HoldingCard({
  fund,
  fund_category,
  allocation_percentage,
  invested_amount,
  returns_amount,
  cagr,
  onPress,
}: HoldingCardProps) {
  const returnsPercentage =
    invested_amount > 0 ? (returns_amount / invested_amount) * 100 : 0;
  const isPositive = returnsPercentage >= 0;
  const sign = isPositive ? "+" : "-";
  const category = fund_category ?? "Mutual Fund";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.fundName} numberOfLines={1} ellipsizeMode="tail">{fund}</Text>
          <Text style={styles.subtitle}>
            {category} · {allocation_percentage}%
          </Text>
          {cagr ? <Text style={styles.cagrText}>{cagr} CAGR</Text> : null}
        </View>
        <Text style={[styles.returns, !isPositive && styles.returnsNegative]}>
          {sign}{Math.abs(returnsPercentage).toFixed(1)}%
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: T.cardBg,
    borderWidth: 1,
    borderColor: "#2848F11A",
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  fundName: {
    fontSize: 15,
    fontWeight: "400",
    color: T.textDark,
    lineHeight: 18,
    letterSpacing: 0.3
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: T.textMuted,
    lineHeight: 14.4,
    letterSpacing: 0.24
  },
  cagrText: {
    fontSize: 11,
    fontWeight: "400",
    color: T.textMuted,
    lineHeight: 13.2,
  },
  returns: {
    fontSize: 20,
    fontWeight: "700",
    color: T.positive,
  },
  returnsNegative: {
    color: T.negative,
  },
});

import { formatCurrency, formatIndianCompact } from "@/utils/formatters";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// ─── Tokens ─────────────────────────────────────────────────────────────────
const T = {
  cardBg: "#F4F4F4",
  textDark: "#111111",
  textMuted: "#8A8A9A",
  trackBg: "#E8E8F4",
  invested: "#2848F1",
  current: "#2848F17A",
} as const;

// ─── Props ──────────────────────────────────────────────────────────────────
interface GoalValueCardProps {
  currentFundValue: number;
  investedAmount: number;
  goalAmount: number;
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function GoalValueCard({
  currentFundValue,
  investedAmount,
  goalAmount,
  onPress,
}: GoalValueCardProps) {
  const percentOfGoal = Math.round((currentFundValue / goalAmount) * 100);
  const investedFraction = Math.min(investedAmount / goalAmount, 1);
  const currentFraction = Math.min(currentFundValue / goalAmount, 1);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={require("@/assets/images/v2/shine-egg.png")} style={styles.eggImage} />

      <Text style={styles.label}>
        CURRENT FUND VALUE · {percentOfGoal}% of goal
      </Text>

      <Text style={styles.mainValue}>{formatCurrency(currentFundValue)}</Text>

      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            { width: `${currentFraction * 100}%`, backgroundColor: T.current },
          ]}
        />
        <View
          style={[
            styles.trackFill,
            {
              width: `${investedFraction * 100}%`,
              backgroundColor: T.invested,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>
          Invested:{" "}
          <Text style={styles.footerBold}>
            {formatCurrency(investedAmount)}
          </Text>
        </Text>
        <Text style={styles.footerMuted}>
          Goal: <Text style={styles.footerBold}>{formatIndianCompact(goalAmount)}</Text>
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
    borderRadius: 24,
    padding: 20,
    overflow: "visible",
  },
  eggImage: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: T.textMuted,
    marginBottom: 6,
    paddingRight: 80,
  },
  mainValue: {
    fontSize: 38,
    fontWeight: "700",
    color: T.textDark,
    marginBottom: 16,
    paddingRight: 80,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: T.trackBg,
    marginBottom: 12,
  },
  trackFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerMuted: {
    fontSize: 14,
    color: T.textMuted,
  },
  footerBold: {
    fontWeight: "700",
    color: T.textDark,
  },
});

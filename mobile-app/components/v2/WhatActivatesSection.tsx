import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Data ───────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "📈",
    title: "Auto SIP begins instantly",
    subtitle: "Starts on your chosen date",
  },
  {
    icon: "🔄",
    title: "Annual rebalancing unlocked",
    subtitle: "Nested AI auto-shifts portfolio as your child grows",
  },
  {
    icon: "💳",
    title: "Instant withdrawals enabled",
    subtitle: "Access funds any time, no delays",
  },
  {
    icon: "⭐",
    title: "Live portfolio tracking",
    subtitle: "Real-time returns, milestones, growth charts",
  },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────
export default function WhatActivatesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>WHAT ACTIVATES AFTER KYC</Text>
      <View style={styles.list}>
        {FEATURES.map((f) => (
          <FeatureRow key={f.title} icon={f.icon} title={f.title} subtitle={f.subtitle} />
        ))}
      </View>
    </View>
  );
}

// ─── FeatureRow ─────────────────────────────────────────────────────────────
function FeatureRow({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A8A9A",
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#8A8A9A",
    lineHeight: 17,
  },
});

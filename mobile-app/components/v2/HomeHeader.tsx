import { Bell, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { formatIndianCompact } from "@/utils/formatters";

interface HomeHeaderProps {
  paddingTop: number;
  userInitial: string;
  firstName: string;
  totalCurrentAmount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeHeader({
  paddingTop,
  userInitial,
  firstName,
  totalCurrentAmount,
}: HomeHeaderProps) {
  const [visible, setVisible] = useState(true);
  const totalCorpus = formatIndianCompact(totalCurrentAmount);

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.greetingRow}>
        <View style={styles.avatarNameRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <Text style={styles.greetingText} numberOfLines={1}>
            {getGreeting()}, {firstName}
          </Text>
        </View>
        <Bell size={20} color="rgba(255,255,255,0.8)" />
      </View>

      <View style={styles.valueSection}>
        <Text style={styles.valueLabel}>CURRENT VALUE</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>
            {visible
              ? `₹${totalCurrentAmount === 0 ? "0.00" : totalCorpus}`
              : "₹••••"}
          </Text>
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {visible ? (
              <Eye size={18} color="rgba(255,255,255,0.8)" />
            ) : (
              <EyeOff size={18} color="rgba(255,255,255,0.8)" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  avatarNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#D42695",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.4,
  },
  greetingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: -0.54,
    flex: 1,
  },
  valueSection: {
    gap: 6,
    marginTop: 16,
  },
  valueLabel: {
    color: "#F4F4F4",
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 0.24,
    textTransform: "uppercase",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountText: {
    color: "#F4F4F4",
    fontSize: 36,
    fontWeight: "600",
    letterSpacing: 1.44,
  },
});

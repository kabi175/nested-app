import { Bell } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatIndianCompact } from "@/utils/formatters";

interface HomeHeaderProps {
  paddingTop: number;
  userInitial: string;
  firstName: string;
  totalCurrentAmount: number;
  totalMonthlySip: number | undefined;
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
  totalMonthlySip,
}: HomeHeaderProps) {
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

      <View style={styles.statsCard}>
        <View style={styles.corpusSection}>
          <Text style={styles.statsLabel}>TOTAL CORPUS</Text>
          <Text style={styles.corpusAmount}>
            ₹{totalCurrentAmount === 0 ? "0.00" : totalCorpus}
          </Text>
        </View>
        <View style={styles.statsBottomRow}>
          <View style={styles.statItem}>
            <Text style={styles.statsLabel}>MONTHLY SIP</Text>
            <Text style={styles.statValue}>
              {totalMonthlySip ? `₹${formatIndianCompact(totalMonthlySip)}` : "—"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2848F1",
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 24,
    gap: 16,
  },
  corpusSection: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 12,
    gap: 4,
  },
  statsLabel: {
    color: "#F4F4F4",
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 0.24,
    textTransform: "uppercase",
  },
  corpusAmount: {
    color: "#F4F4F4",
    fontSize: 36,
    fontWeight: "600",
    letterSpacing: 1.44,
  },
  statsBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: { gap: 6 },
  statValue: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

import TopColleges from "@/assets/images/v2/education-plan/top-colleges.svg";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Tokens ─────────────────────────────────────────────────────────────────
const T = {
  cardBg: "#EEEEF5",
  primary: "#3137D5",
  textDark: "#111111",
  textMuted: "#8A8A9A",
  trackBg: "#D9D9D9",
  capIconBg: "#E8E8F4",
  divider: "#D9D9E3",
} as const;

// ─── Props ──────────────────────────────────────────────────────────────────
interface ChildPlanCardProps {
  childName: string;
  childAge: number;
  collegeType?: string;
  goalYear: number;
  goalAmount: string;
  savedAmount?: string;
  savedFraction?: number; // 0–1
  nextSipAmount?: string | null;
  nextSipDate?: string | null;
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ChildPlanCard({
  childName,
  childAge,
  collegeType = "Top College",
  goalYear,
  goalAmount = "₹50L",
  savedAmount = "₹0",
  savedFraction = 0,
  nextSipAmount,
  nextSipDate,
}: ChildPlanCardProps) {
  const clampedFraction = Math.min(Math.max(savedFraction, 0), 1);
  const hasSip = !!nextSipAmount && !!nextSipDate;

  return (
    <View style={styles.card}>
      {/* ── Header row ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.childName}>
            <Text style={styles.nameBold}>{childName}</Text>
            {`, Age ${childAge}`}
          </Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.capEmoji}>🎓</Text>
            <Text style={styles.subtitle}>{`${collegeType} · ${goalYear}`}</Text>
          </View>
        </View>

        {/* ── College icon ── */}
        <View style={styles.capIconWrapper}>
          <TopColleges width={40} height={40} />
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${clampedFraction * 100}%` }]} />
      </View>

      {/* ── Saved / Goal row ── */}
      <View style={[styles.savingsRow, !hasSip && { marginBottom: 0 }]}>
        <Text style={styles.savedText}>
          <Text style={styles.savedAmount}>{savedAmount}</Text>
          {" saved"}
        </Text>
        <Text style={styles.goalText}>
          {"Goal "}
          <Text style={styles.goalAmount}>{goalAmount}</Text>
        </Text>
      </View>

      {/* ── Next SIP (only when data is available) ── */}
      {hasSip && (
        <>
          <View style={styles.divider} />
          <View style={styles.sipRow}>
            <Text style={styles.sipLabel}>Next SIP</Text>
            <Text style={styles.sipValue}>{`${nextSipAmount} · ${nextSipDate}`}</Text>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: T.cardBg,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 20,
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  childName: {
    fontSize: 22,
    color: T.textDark,
    marginBottom: 6,
  },
  nameBold: {
    fontWeight: "700",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  capEmoji: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    color: T.textMuted,
  },
  capIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: T.capIconBg,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Progress ──
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: T.trackBg,
    overflow: "hidden",
    marginBottom: 10,
  },
  trackFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 5,
  },

  // ── Savings row ──
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  savedText: {
    fontSize: 14,
    color: T.textMuted,
  },
  savedAmount: {
    fontWeight: "700",
    color: T.textDark,
    fontSize: 14,
  },
  goalText: {
    fontSize: 14,
    color: T.textMuted,
  },
  goalAmount: {
    fontWeight: "700",
    color: T.textDark,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: T.divider,
    marginBottom: 14,
  },

  // ── Next SIP ──
  sipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sipLabel: {
    fontSize: 15,
    color: T.textDark,
  },
  sipValue: {
    fontSize: 15,
    fontWeight: "700",
    color: T.textDark,
  },
});

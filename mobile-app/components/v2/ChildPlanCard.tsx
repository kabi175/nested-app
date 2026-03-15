import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GraduationCap from "@/assets/images/v2/planner/graduation-cap.svg";
import Button from "@/components/v2/Button";

// ─── Tokens ─────────────────────────────────────────────────────────────────
const T = {
  cardBg: "#EEEEF5",
  primary: "#3137D5",
  textDark: "#111111",
  textMuted: "#8A8A9A",
  trackBg: "#D9D9D9",
  circleBg: "#E3E3F0",
  capIconBg: "#E8E8F4",
} as const;

const MILESTONES = [6, 10, 14, 18];

// ─── Props ──────────────────────────────────────────────────────────────────
interface ChildPlanCardProps {
  childName: string;
  childAge: number;
  collegeType?: string;
  goalYear?: number;
  goalAmount?: string;
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ChildPlanCard({
  childName,
  childAge,
  collegeType = "Top College",
  goalYear = 2037,
  goalAmount = "₹50L",
  onPress,
}: ChildPlanCardProps) {
  // Clamp current age to the milestone range for progress calculation
  const minAge = MILESTONES[0];
  const maxAge = MILESTONES[MILESTONES.length - 1];
  const clampedAge = Math.min(Math.max(childAge, minAge), maxAge);
  const progressFraction = (clampedAge - minAge) / (maxAge - minAge);

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
            <Text style={styles.subtitle}>
              {`${collegeType} · ${goalYear} Goal `}
              <Text style={styles.goalAmount}>{goalAmount}</Text>
            </Text>
          </View>
        </View>

        {/* ── Graduation cap icon ── */}
        <View style={styles.capIconWrapper}>
          <GraduationCap width={48} height={48} />
        </View>
      </View>

      {/* ── Age timeline ── */}
      <View style={styles.timelineContainer}>
        {/* Track */}
        <View style={styles.track}>
          {/* Blue fill up to current age */}
          <View style={[styles.trackFill, { width: `${progressFraction * 100}%` }]} />
        </View>

        {/* Milestone circles (absolutely overlaid on track) */}
        {MILESTONES.map((age, i) => {
          const fraction = (age - minAge) / (maxAge - minAge);
          return (
            <View
              key={age}
              style={[styles.milestoneWrapper, { left: `${fraction * 100}%` }]}
            >
              <View style={styles.circle} />
              <Text style={styles.ageLabel}>{`Age ${age}`}</Text>
            </View>
          );
        })}
      </View>

      {/* ── CTA ── */}
      <View style={styles.buttonWrapper}>
        <Button title="Start Saving Now →" onPress={onPress} />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const CIRCLE_SIZE = 28;
const CIRCLE_OFFSET = CIRCLE_SIZE / 2;

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.cardBg,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
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
  goalAmount: {
    fontWeight: "700",
    color: T.textDark,
  },
  capIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: T.capIconBg,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Timeline ──
  timelineContainer: {
    position: "relative",
    height: CIRCLE_SIZE + 28, // circle + label below
    marginHorizontal: CIRCLE_OFFSET,
    marginBottom: 24,
  },
  track: {
    position: "absolute",
    top: CIRCLE_SIZE / 2 - 3,
    left: -CIRCLE_OFFSET,
    right: -CIRCLE_OFFSET,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.trackBg,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: T.primary,
    borderRadius: 3,
  },
  milestoneWrapper: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -CIRCLE_OFFSET }],
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: T.circleBg,
  },
  ageLabel: {
    marginTop: 6,
    fontSize: 12,
    color: T.textMuted,
    fontWeight: "500",
  },

  // ── Button ──
  buttonWrapper: {
    // full-width button
  },
});

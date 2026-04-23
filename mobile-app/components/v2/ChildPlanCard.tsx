import ArtDesign from "@/assets/images/v2/education-plan/art-design.svg";
import IitNit from "@/assets/images/v2/education-plan/iit-nit.svg";
import Mba from "@/assets/images/v2/education-plan/mba.svg";
import Medical from "@/assets/images/v2/education-plan/medical.svg";
import StudyAbroad from "@/assets/images/v2/education-plan/study-abroad.svg";
import TopColleges from "@/assets/images/v2/education-plan/top-colleges.svg";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

const EDUCATION_ICONS: Record<string, React.FC<SvgProps>> = {
  "top-colleges": TopColleges,
  "medical": Medical,
  "mba": Mba,
  "study-abroad": StudyAbroad,
  "arts": ArtDesign,
  "iits": IitNit,
};

// ─── Tokens ─────────────────────────────────────────────────────────────────
const T = {
  primary: "#3137D5",
  textDark: "#111111",
  textMuted: "#8A8A9A",
  trackBg: "#D9D9D9",
  capIconBg: "#E8E8F4",
  divider: "#D9D9E3",
  onTrackBg: "#E6F4EA",
  onTrackText: "#1E7E34",
  cardBorder: "#2848F1",
} as const;

// ─── Props ──────────────────────────────────────────────────────────────────
interface ChildPlanCardProps {
  childName: string;
  childAge: number;
  educationId?: string;
  collegeType?: string;
  goalYear: number;
  goalAmount: string;
  savedAmount?: string;
  showDelete?: boolean;
  savedFraction?: number; // 0–1
  nextSipAmount?: string | null;
  nextSipDate?: string | null;
  actionLabel?: string;
  isOnTrack?: boolean;
  sipLabel?: string;
  onPressAction?: () => void;
  onPressDelete?: () => void;
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ChildPlanCard({
  childName,
  childAge,
  educationId,
  collegeType = "Top College",
  goalYear,
  goalAmount = "₹50L",
  savedAmount = "₹0",
  savedFraction = 0,
  nextSipAmount,
  nextSipDate,
  actionLabel,
  isOnTrack,
  sipLabel,
  showDelete,
  onPressAction,
  onPressDelete,
  onPress,
}: ChildPlanCardProps) {
  const clampedFraction = Math.min(Math.max(savedFraction, 0), 1);
  const hasSip = !!nextSipAmount && !!nextSipDate;
  const isInvested = savedFraction > 0;
  const Icon = (educationId && EDUCATION_ICONS[educationId]) || TopColleges;

  console.log("[ChildPlanCard]", childName, { actionLabel, savedFraction, hasSip });

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient
        colors={["#FFFFFF", "#EEEFFE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        {/* ── College icon (absolute top-right) ── */}
        <View style={styles.capIconWrapper}>
          <Icon width={40} height={40} />
        </View>

        {/* ── Header row ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.nameRow}>
              <Text style={styles.childName}>
                <Text style={styles.nameBold}>{childName}</Text>
                {`, Age ${childAge}`}
              </Text>
              {isOnTrack && (
                <View style={styles.onTrackBadge}>
                  <Text style={styles.onTrackText}>• on track</Text>
                </View>
              )}
            </View>
            <View style={styles.subtitleRow}>
              <Text style={styles.capEmoji}>🎓</Text>
              <Text style={styles.subtitle}>{`${collegeType} · ${goalYear}`}</Text>
            </View>
          </View>
        </View>

        {/* ── Progress bar ── */}
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${clampedFraction * 100}%` }]} />
        </View>

        {/* ── Saved / Goal row ── */}
        {isInvested ? (
          <View style={[styles.savingsRow, !hasSip && { marginBottom: 0 }]}>
            <Text style={styles.savedLarge}>
              <Text style={styles.savedLargeAmount}>{savedAmount}</Text>
              <Text style={styles.savedLargeSuffix}> saved</Text>
            </Text>
            <Text style={styles.goalTextSmall}>
              {"Goal "}
              <Text style={styles.goalAmountSmall}>{goalAmount}</Text>
            </Text>
          </View>
        ) : (
          <View style={[styles.savingsRow, !hasSip && { marginBottom: 0 }]}>
            <Text style={styles.savedText}>
              <Text style={styles.savedAmount}>{savedAmount}</Text>
              {" invested"}
            </Text>
            <Text style={styles.goalText}>
              {"Goal "}
              <Text style={styles.goalAmount}>{goalAmount}</Text>
            </Text>
          </View>
        )}

        {/* ── SIP row (only when data is available) ── */}
        {hasSip && (
          <>
            <View style={styles.divider} />
            <View style={styles.sipRow}>
              <Text style={styles.sipLabel}>{sipLabel ?? "Monthly SIP"}</Text>
              <Text style={styles.sipValue}>{`${nextSipAmount} · ${nextSipDate}`}</Text>
            </View>
          </>
        )}

        {/* ── Action button ── */}
        {!!actionLabel && (
          <Pressable onPress={onPressAction} style={styles.actionButtonWrapper}>
            <LinearGradient
              colors={["#5B70FF", "#2848F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* ── Delete link ── */}
        {(!!onPressDelete && showDelete) && (
          <Pressable onPress={onPressDelete} style={styles.deleteLink}>
            <Text style={styles.deleteLinkText}>Delete goal</Text>
          </Pressable>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pressable: {
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    paddingBottom: 20,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: T.cardBorder,
  },

  // ── Header ──
  headerRow: {
    marginBottom: 20,
    paddingRight: 72,
  },
  headerLeft: {},
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  childName: {
    fontSize: 22,
    color: T.textDark,
  },
  nameBold: {
    fontWeight: "700",
  },
  onTrackBadge: {
    backgroundColor: T.onTrackBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  onTrackText: {
    fontSize: 11,
    color: T.onTrackText,
    fontWeight: "600",
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
    position: "absolute",
    top: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
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

  // ── Savings row (not invested) ──
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

  // ── Savings row (invested) ──
  savedLarge: {
    fontSize: 22,
  },
  savedLargeAmount: {
    fontWeight: "700",
    color: T.textDark,
    fontSize: 22,
  },
  savedLargeSuffix: {
    fontWeight: "400",
    color: T.textMuted,
    fontSize: 22,
  },
  goalTextSmall: {
    fontSize: 13,
    color: T.textMuted,
    alignSelf: "flex-end",
  },
  goalAmountSmall: {
    fontWeight: "700",
    color: T.textDark,
    fontSize: 13,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: T.divider,
    marginBottom: 14,
  },

  // ── SIP row ──
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

  // ── Action button ──
  actionButtonWrapper: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButton: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // ── Delete link ──
  deleteLink: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  deleteLinkText: {
    fontSize: 12,
    color: T.primary,
    textDecorationLine: "underline",
    letterSpacing: 0.24,
  },
});

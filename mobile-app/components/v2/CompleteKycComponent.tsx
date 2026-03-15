import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types/auth";
import Button from "@/components/v2/Button";

// ─── Tokens ────────────────────────────────────────────────────────────────
const T = {
  bg: "#EEEEF5",
  primary: "#3137D5",
  eyebrow: "#6E75CC",
  textDark: "#111111",
  textMuted: "#6B7280",
  checkBg: "#D6F0DC",
  checkColor: "#3DAB5C",
  stepCircleBg: "#E3E3F5",
  stepCircleText: "#4D52C4",
  progressTrack: "#D9D9D9",
  progressFill: "#3137D5",
} as const;

// ─── KYC order (excluding "failed" — treat as unknown) ─────────────────────
const KYC_ORDER: Array<User["kycStatus"]> = [
  "unknown",
  "pending",
  "aadhaar_pending",
  "esign_pending",
  "submitted",
  "completed",
];

function getKycIndex(status: User["kycStatus"]): number {
  const idx = KYC_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx; // "failed" → 0
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface CompleteKycComponentProps {
  childName: string;
  monthlyAmount?: string;
  onPressContinue?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function CompleteKycComponent({
  childName,
  monthlyAmount,
  onPressContinue,
}: CompleteKycComponentProps) {
  const { data: user } = useUser();
  const { data: bankAccounts } = useBankAccounts();

  const kycStatus = user?.kycStatus ?? "unknown";
  const kycIndex = getKycIndex(kycStatus);
  const hasBankAccount = (bankAccounts?.length ?? 0) > 0;

  const steps: { label: string; done: boolean }[] = [
    { label: "Mobile verified",    done: true },
    { label: "PAN card linking",   done: kycIndex >= 2 },
    { label: "Aadhar verification",done: kycIndex >= 3 },
    { label: "Verify your details",done: kycIndex >= 4 },
    { label: "Link bank account",  done: hasBankAccount },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = `${(completedCount / steps.length) * 100}%` as `${number}%`;

  return (
    <View style={styles.container}>
      {/* ── Eyebrow ── */}
      <Text style={styles.eyebrow}>ONE STEP AWAY</Text>

      {/* ── Title ── */}
      <Text style={styles.title}>
        {"Activate your plan.\nFund "}
        <Text>{childName}</Text>
        {"'s education ."}
      </Text>

      {/* ── Subtitle ── */}
      {monthlyAmount ? (
        <Text style={styles.subtitle}>
          {`Complete KYC under 2 min, your ${monthlyAmount}\nauto-balancing plan will begin immediately after.`}
        </Text>
      ) : (
        <Text style={styles.subtitle}>
          Complete KYC under 2 min and your auto-balancing plan will begin immediately after.
        </Text>
      )}

      {/* ── Steps ── */}
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <StepRow
            key={step.label}
            number={index + 1}
            label={step.label}
            done={step.done}
          />
        ))}
      </View>

      {/* ── Progress bar ── */}
      <Text style={styles.progressLabel}>KYC Progress</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPercent }]} />
      </View>
      <Text style={styles.progressText}>
        {completedCount} of {steps.length} done
      </Text>

      {/* ── CTA ── */}
      <Button title="Continue KYC →" onPress={onPressContinue} />
    </View>
  );
}

// ─── StepRow ────────────────────────────────────────────────────────────────
function StepRow({
  number,
  label,
  done,
}: {
  number: number;
  label: string;
  done: boolean;
}) {
  return (
    <View style={styles.stepRow}>
      {done ? (
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      ) : (
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
      )}
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    color: T.eyebrow,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: T.textDark,
    lineHeight: 34,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: T.textMuted,
    lineHeight: 22,
    marginBottom: 32,
  },
  steps: {
    gap: 20,
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.checkBg,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: T.checkColor,
    fontSize: 16,
    fontWeight: "700",
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.stepCircleBg,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: T.stepCircleText,
    fontSize: 14,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 16,
    color: T.textDark,
    fontWeight: "400",
  },
  stepLabelDone: {
    textDecorationLine: "line-through",
    color: T.textMuted,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: T.textMuted,
    marginBottom: 8,
  },
  progressTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: T.progressTrack,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: T.progressFill,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    color: T.primary,
    textAlign: "right",
    marginBottom: 24,
  },
});

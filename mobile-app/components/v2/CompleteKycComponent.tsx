import { useBankAccounts } from "@/hooks/useBankAccount";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types/auth";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Tokens ────────────────────────────────────────────────────────────────
const T = {
  gradStart: "#001BAB",
  gradEnd: "#26E0F8",
  text: "#FFFFFF",
  eyebrow: "rgba(255,255,255,0.72)",
  radius: 16,
} as const;

// ─── KYC order ─────────────────────────────────────────────────────────────
const KYC_ORDER: User["kycStatus"][] = [
  "unknown",
  "pending",
  "aadhaar_pending",
  "esign_pending",
  "submitted",
  "completed",
];

function getKycIndex(status: User["kycStatus"]): number {
  const idx = KYC_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface CompleteKycComponentProps {
  childName?: string;
  monthlyAmount?: string;
  onPressContinue?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function CompleteKycComponent({
  childName = "Child",
  monthlyAmount,
  onPressContinue,
}: CompleteKycComponentProps) {
  const { data: user } = useUser();
  const { data: bankAccounts } = useBankAccounts();

  const kycStatus = user?.kycStatus ?? "unknown";
  const kycIndex = getKycIndex(kycStatus);
  const hasBankAccount = (bankAccounts?.length ?? 0) > 0;

  const steps = [
    { done: true },
    { done: kycIndex >= 2 },
    { done: kycIndex >= 3 },
    { done: kycIndex >= 4 },
    { done: hasBankAccount },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <TouchableOpacity onPress={onPressContinue} activeOpacity={0.85}>
      {/* Triangle indicator */}
      {/* <View style={styles.triangleWrapper}>
        <View style={styles.triangle} />
      </View> */}

      <LinearGradient
        colors={[T.gradStart, T.gradEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.eyebrow}>
              {`KYC UNDER 2 MIN · ${completedCount}/${steps.length} STEPS`}
            </Text>
            <Text style={styles.title}>
              {"Activate your plan.\nFund "}
              <Text style={styles.title}>{childName}</Text>
              {"'s education ."}
            </Text>
          </View>
          <ArrowRight size={24} color={T.text} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  triangleWrapper: {
    alignItems: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: T.gradStart,
  },
  card: {
    borderRadius: T.radius,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "500",
    color: T.eyebrow,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: T.text,
    lineHeight: 28,
  },
  arrow: {
    marginLeft: 16,
  },
});

import { formatCompactCurrency } from "@/utils/formatters";
import { Pencil } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface NestGrowthCardProps {
  targetAmount: number;
  editable?: boolean;
  onAmountChange?: (amount: number) => void;
  targetYear: number;
  remainingYears: number;
  totalInvested: number;
}

export default function NestGrowthCard({
  targetAmount,
  editable = false,
  onAmountChange,
  targetYear,
  remainingYears,
  totalInvested,
}: NestGrowthCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(targetAmount));

  const fillPercent = targetAmount > 0
    ? Math.min(totalInvested / targetAmount, 1)
    : 0;

  const handleEditConfirm = () => {
    const parsed = parseInt(inputValue.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      onAmountChange?.(parsed);
    } else {
      setInputValue(String(targetAmount));
    }
    setEditing(false);
  };

  // Sync inputValue when targetAmount changes externally (e.g. after lumpsum update)
  React.useEffect(() => {
    if (!editing) {
      setInputValue(String(targetAmount));
    }
  }, [targetAmount, editing]);

  return (
    <View style={styles.outerBorder}>
      <View style={styles.card}>
        <Text style={styles.growLabel}>YOUR NEST WILL GROW TO</Text>

        {/* Amount row */}
        <View style={styles.amountRow}>
          {editing ? (
            <TextInput
              style={styles.amountInput}
              value={inputValue}
              onChangeText={setInputValue}
              onBlur={handleEditConfirm}
              onSubmitEditing={handleEditConfirm}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.amount}>
              {formatCompactCurrency(targetAmount)}
            </Text>
          )}
          {editable && !editing && (
            <Pressable
              style={styles.editButton}
              onPress={() => {
                setInputValue(String(targetAmount));
                setEditing(true);
              }}
              hitSlop={8}
            >
              <Pencil size={18} color="#6E6F7A" />
            </Pressable>
          )}
        </View>

        {/* Year info */}
        <Text style={styles.yearInfo}>
          By {targetYear}{"  "}•{"  "}{remainingYears} years from now
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPercent * 100}%` }]} />
        </View>

        {/* Labels */}
        <View style={styles.labelsRow}>
          <Text style={styles.progressLabel}>
            What you invest{"\n"}({formatCompactCurrency(totalInvested)})
          </Text>
          <Text style={[styles.progressLabel, styles.progressLabelRight]}>
            What you get{"\n"}({formatCompactCurrency(targetAmount)})
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 1.5,
    borderColor: "#3137D5",
    borderRadius: 16,
    padding: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  growLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E6F7A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  amount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1D1E20",
    letterSpacing: -0.5,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1D1E20",
    borderBottomWidth: 1.5,
    borderBottomColor: "#3137D5",
    minWidth: 120,
    paddingBottom: 2,
  },
  editButton: {
    padding: 4,
  },
  yearInfo: {
    fontSize: 13,
    color: "#6E6F7A",
    marginBottom: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#EAEAF2",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3137D5",
    borderRadius: 4,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    color: "#6E6F7A",
    lineHeight: 18,
  },
  progressLabelRight: {
    textAlign: "right",
  },
});

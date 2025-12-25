import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";

interface NomineeFooterProps {
  totalAllocation: number;
  draftNomineesCount: number;
  onSave: () => void;
}

export function NomineeFooter({
  totalAllocation,
  draftNomineesCount,
  onSave,
}: NomineeFooterProps) {
  const isComplete = totalAllocation === 100;
  const hasDrafts = draftNomineesCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.allocationContainer}>
        <Text category="s1" style={styles.label}>
          Total Allocation
        </Text>
        <View style={styles.barContainer}>
          <View style={styles.progressBarWrapper}>
            <ProgressBar
              progress={totalAllocation / 100}
              color={isComplete ? "#10B981" : "#7C3AED"}
              backgroundColor="#E5E7EB"
              height={10}
            />
          </View>
          <Text category="s2" style={styles.allocationText}>
            {totalAllocation} / 100%
          </Text>
        </View>
        {isComplete ? (
          <View style={styles.successBanner}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text category="s2" style={styles.successText}>
              Perfect! Your allocation is complete at 100%
            </Text>
          </View>
        ) : hasDrafts ? (
          <View style={styles.errorBanner}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text category="s2" style={styles.errorMessage}>
              Total allocation must be exactly 100%. Current: {totalAllocation}%
            </Text>
          </View>
        ) : null}
      </View>

      {hasDrafts && (
        <Button
          style={styles.saveButton}
          status="primary"
          onPress={onSave}
          disabled={!isComplete}
          size="large"
        >
          {`Save ${draftNomineesCount} Nominee${
            draftNomineesCount > 1 ? "s" : ""
          }`}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  allocationContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressBarWrapper: {
    flex: 1,
  },
  allocationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    minWidth: 60,
    textAlign: "right",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successCheckmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#065F46",
    fontWeight: "600",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  errorIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: 12,
    width: "100%",
  },
});


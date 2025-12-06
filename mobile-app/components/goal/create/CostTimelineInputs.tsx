import { ThemedText } from "@/components/ThemedText";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface CostTimelineInputsProps {
  currentCost: number;
  targetYear: number;
  onCurrentCostChange: (cost: number) => void;
  onTargetYearChange: (year: number) => void;
}

export function CostTimelineInputs({
  currentCost,
  targetYear,
  onCurrentCostChange,
  onTargetYearChange,
}: CostTimelineInputsProps) {
  return (
    <View style={styles.costTimelineContainer}>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>
          Today&apos;s Approx Cost
        </ThemedText>
        <View style={styles.costInputContainer}>
          <ThemedText style={styles.currencySymbol}>₹</ThemedText>
          <TextInput
            style={styles.costInput}
            value={currentCost.toLocaleString("en-IN")}
            onChangeText={(text) => {
              const value = parseInt(text.replace(/,/g, "")) || 0;
              onCurrentCostChange(value);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Target Year</ThemedText>
        <View style={styles.yearInputContainer}>
          <TextInput
            style={styles.yearInput}
            value={targetYear.toString()}
            onChangeText={(text) => {
              const value =
                parseInt(text) || new Date().getFullYear();
              onTargetYearChange(value);
            }}
            keyboardType="numeric"
          />
          <View style={styles.yearControls}>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => onTargetYearChange(targetYear + 1)}
            >
              <ChevronUp size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => onTargetYearChange(targetYear - 1)}
            >
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  costTimelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  costInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  yearInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  yearInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  yearControls: {
    flexDirection: "column",
    marginLeft: 8,
  },
  yearButton: {
    padding: 4,
  },
});


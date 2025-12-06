import { ThemedText } from "@/components/ThemedText";
import { Edit3 } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface FutureCostDisplayProps {
  futureCost: number;
  hasEducation: boolean;
  pulseAnim: Animated.Value;
  onFutureCostChange: (cost: number) => void;
}

export function FutureCostDisplay({
  futureCost,
  hasEducation,
  pulseAnim,
  onFutureCostChange,
}: FutureCostDisplayProps) {
  return (
    <Animated.View
      style={[
        styles.futureCostContainer,
        {
          transform: [
            {
              scale: pulseAnim,
            },
          ],
        },
      ]}
    >
      <View style={styles.futureCostHeader}>
        <ThemedText style={styles.futureCostLabel}>
          Expected Future Cost
        </ThemedText>
        <TouchableOpacity style={styles.editButton}>
          <Edit3 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View style={styles.futureCostInputContainer}>
        <ThemedText style={styles.currencySymbol}>₹</ThemedText>
        <TextInput
          style={styles.futureCostInput}
          value={futureCost.toLocaleString("en-IN")}
          onChangeText={(text) => {
            const value = parseInt(text.replace(/,/g, "")) || 0;
            onFutureCostChange(value);
          }}
          keyboardType="numeric"
        />
      </View>
      <ThemedText style={styles.futureCostDescription}>
        {hasEducation
          ? `Calculated based on expected fee increases`
          : "Select a course or college to see future cost"}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  futureCostContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  futureCostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  futureCostLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  editButton: {
    padding: 4,
  },
  futureCostInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  futureCostInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  futureCostDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
});


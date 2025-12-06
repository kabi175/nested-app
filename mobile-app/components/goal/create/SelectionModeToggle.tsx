import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface SelectionModeToggleProps {
  selectionMode: "course" | "college";
  onModeChange: (mode: "course" | "college") => void;
}

export function SelectionModeToggle({
  selectionMode,
  onModeChange,
}: SelectionModeToggleProps) {
  return (
    <Animated.View style={styles.selectionModeContainer}>
      <TouchableOpacity
        style={[
          styles.selectionModeButton,
          selectionMode === "course" && styles.selectionModeButtonActive,
        ]}
        onPress={() => onModeChange("course")}
      >
        <ThemedText
          style={[
            styles.selectionModeText,
            selectionMode === "course" && styles.selectionModeTextActive,
          ]}
        >
          Course Type
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.selectionModeButton,
          selectionMode === "college" && styles.selectionModeButtonActive,
        ]}
        onPress={() => onModeChange("college")}
      >
        <ThemedText
          style={[
            styles.selectionModeText,
            selectionMode === "college" && styles.selectionModeTextActive,
          ]}
        >
          Dream College
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  selectionModeContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  selectionModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  selectionModeButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectionModeTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
});


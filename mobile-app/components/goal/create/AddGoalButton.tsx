import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import { Plus } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

interface AddGoalButtonProps {
  onPress: () => void;
}

export function AddGoalButton({ onPress }: AddGoalButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.addGoalButton} onPress={handlePress}>
      <Plus size={24} color="#2563EB" />
      <ThemedText style={styles.addGoalText}>Add another goal</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addGoalButton: {
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 8,
  },
});


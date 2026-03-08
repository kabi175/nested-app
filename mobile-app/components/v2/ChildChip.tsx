import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export interface ChildChipProps {
  name: string;
  age: number;
  selected?: boolean;
  onPress?: () => void;
}

export default function ChildChip({
  name,
  age,
  selected = false,
  onPress,
}: ChildChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {name}, {age}y/o
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#D4D4D4",
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    borderColor: "#3137D5",
    backgroundColor: "#EEEFFE",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3A3A3A",
  },
  labelSelected: {
    color: "#3137D5",
    fontWeight: "600",
  },
});

import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
    >
      <ChevronLeft size={20} color="#1A1A1A" strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EEEEF6",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: "#E0E0EF",
  },
});

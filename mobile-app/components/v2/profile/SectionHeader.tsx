import React from "react";
import { StyleSheet, Text } from "react-native";

interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return <Text style={styles.header}>{label}</Text>;
}

const styles = StyleSheet.create({
  header: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
});

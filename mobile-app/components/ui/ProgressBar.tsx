import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  height?: number;
}

/**
 * Simple Progress Bar Component
 */
export function ProgressBar({
  progress,
  color = "#2563EB",
  backgroundColor = "#E5E7EB",
  height = 8,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, height, borderRadius: height / 2 },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  fill: {
    // Styles applied inline
  },
});


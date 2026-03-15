import React from "react";
import { Animated, StyleSheet, View } from "react-native";

interface ProgressBarProps {
  total: number;
  currentIndex: number;
  /** Animated.Value from 0→1 representing fill progress of the active segment */
  fillProgress: Animated.Value;
}

export default function ProgressBar({ total, currentIndex, fillProgress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => {
        if (i < currentIndex) {
          // Completed — fully filled
          return <View key={i} style={[styles.segment, styles.completed]} />;
        }

        if (i === currentIndex) {
          // Active — animated fill over a gray track
          return (
            <View key={i} style={[styles.segment, styles.inactive]}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width: fillProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          );
        }

        // Future — gray
        return <View key={i} style={[styles.segment, styles.inactive]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  completed: {
    backgroundColor: "#10185A",
  },
  inactive: {
    backgroundColor: "#E0E0E0",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#10185A",
  },
});

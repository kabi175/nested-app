import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressBarProps {
  total: number;
  currentIndex: number;
}

export default function ProgressBar({ total, currentIndex }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i === currentIndex
              ? styles.active
              : i < currentIndex
              ? styles.completed
              : styles.inactive,
          ]}
        />
      ))}
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
  },
  active: {
    backgroundColor: "#10185A",
  },
  completed: {
    backgroundColor: "#10185A",
  },
  inactive: {
    backgroundColor: "#E0E0E0",
  },
});

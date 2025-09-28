import HowNestedHelps from "@/components/HowNestedHelps";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const handleStartGoal = () => {
    // Navigate to goal creation or home screen
    console.log("Navigate to goal creation");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HowNestedHelps onStartGoal={handleStartGoal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

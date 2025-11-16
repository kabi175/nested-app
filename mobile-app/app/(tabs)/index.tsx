import IntroScreen from "@/components/IntroScreen";
import { PendingActivityBanner } from "@/components/PendingActivityBanner";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <IntroScreen />
      <PendingActivityBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

interface OnboardingCardProps {
  /** Custom illustration renderer — each slide owns its composition */
  renderIllustration: () => React.ReactNode;
  description: string;
}

export default function OnboardingCard({
  renderIllustration,
  description,
}: OnboardingCardProps) {
  return (
    <View style={styles.card}>
      {/* Illustration area — fills available space */}
      <View style={styles.illustrationArea}>
        {renderIllustration()}
      </View>

      {/* Description at the bottom */}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#F5E0B8",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  } as ViewStyle,

  illustrationArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  description: {
    fontSize: 13,
    textAlign: "center",
    color: "#4A4A4A",
    lineHeight: 19,
    marginTop: 16,
    paddingHorizontal: 8,
  },
});

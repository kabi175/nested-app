import { Layout, Text } from "@ui-kitten/components";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function LaunchingSoon() {
  const handleRegister = () => {
    // Handle register action
    console.log("Register clicked");
  };

  const handleJoinWaitlist = () => {
    // Handle join waitlist action
    console.log("Join Waitlist clicked");
  };

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Title */}
      <Text category="h3" style={styles.title}>
        Launching Soon
      </Text>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Left Card: Olympiads & Contests */}
        <View style={[styles.card, styles.leftCard]}>
          <Text category="h5" style={styles.cardTitle}>
            Olympiads & Contests
          </Text>
          <Text category="p1" style={styles.cardDescription}>
            Curated list of olympiads, competitions and contests to build your
            child's confidence
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.leftButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRegister}
          >
            <Text style={styles.leftButtonText}>Register</Text>
          </Pressable>
        </View>

        {/* Right Card: Assurance */}
        <View style={[styles.card, styles.rightCard]}>
          <Text category="h5" style={styles.cardTitle}>
            Assurance
          </Text>
          <Text category="p1" style={styles.cardDescription}>
            Get peace of mind and ensure continuity even when you are not around
            for just <Text style={styles.priceText}>₹299/month</Text>.
            Comprehensive coverage for your family's future.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.rightButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleJoinWaitlist}
          >
            <Text style={styles.rightButtonText}>Join Waitlist</Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 24,
  },
  cardsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    paddingHorizontal: 4,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "space-between",
    minHeight: 240,
  },
  leftCard: {
    backgroundColor: "#FEECEB",
  },
  rightCard: {
    backgroundColor: "#E0F2F7",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginBottom: 16,
    flex: 1,
  },
  priceText: {
    fontWeight: "600",
    color: "#1F2937",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  leftButton: {
    backgroundColor: "#FCD5D2",
  },
  rightButton: {
    backgroundColor: "#B8E4F0",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  leftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  rightButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
});

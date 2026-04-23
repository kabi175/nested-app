import InvestSuperFd from "@/assets/images/v2/invest-superfd.svg";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SuperFdCardProps {
  onPress: () => void;
}

export default function SuperFdCard({ onPress }: SuperFdCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <LinearGradient
        colors={["#5468E8", "#1E2AAA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        {/* ── "UP TO 11% P.A." teal tag (top-right) ── */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>UP TO 11% P.A.</Text>
        </View>

        {/* ── Illustration (absolute bottom-right) ── */}
        <View style={styles.illustrationWrapper}>
          <InvestSuperFd width={140} height={150} />
        </View>

        {/* ── Text + button ── */}
        <View style={styles.left}>
          <Text style={styles.title}>Invest in SuperFD</Text>
          <Text style={styles.desc}>
            {"Beat the regular FD\nrates with superFD"}
          </Text>
          <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Invest now →</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    paddingTop: 42,
    paddingBottom: 24,
    overflow: "hidden",
  },

  // ── Tag ──
  tag: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#00C49A",
    borderBottomLeftRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Illustration ──
  illustrationWrapper: {
    position: "absolute",
    bottom: -10,
    right: 10,
  },

  // ── Text + button ──
  left: {
    gap: 10,
    paddingRight: 130,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 21,
  },
  button: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2AAA",
  },
});

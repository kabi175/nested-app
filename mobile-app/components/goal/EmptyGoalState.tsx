import { ThemedText } from "@/components/ThemedText";
import type { Child } from "@/types/user";
import { ArrowRight, GraduationCap } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface EmptyGoalStateProps {
  hasChildren: boolean;
  firstChild: Child | null;
  onCreateChild: () => void;
  onCreateGoal: () => void;
}

export function EmptyGoalState({
  hasChildren,
  firstChild,
  onCreateChild,
  onCreateGoal,
}: EmptyGoalStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.mainTitle}>Educational Goals</ThemedText>
          <ThemedText style={styles.subtitle}>
            Building your future, one goal at a time
          </ThemedText>
        </View>

        {/* Illustration Section */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationContainer}>
            <GraduationCap size={80} color="#3B82F6" />
          </View>
        </View>

        {/* Message Section */}
        <View style={styles.messageSection}>
          <ThemedText style={styles.messageText}>
            No goals yet! Create your first goal to start investing in your
            child&apos;s education.
          </ThemedText>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => (hasChildren ? onCreateGoal() : onCreateChild())}
          activeOpacity={0.8}
        >
          <View style={styles.buttonGradient}>
            <ThemedText style={styles.ctaButtonText}>
              Create Goal for {firstChild?.firstName || "your child"}
            </ThemedText>
            <ArrowRight size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  illustrationSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  illustrationContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    backgroundColor: "#F1F5F9",
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  illustrationAccent: {
    position: "absolute",
    top: -10,
    right: -10,
    alignItems: "center",
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    marginBottom: 4,
  },
  accentLine: {
    width: 2,
    height: 20,
    backgroundColor: "#10B981",
    borderRadius: 1,
  },
  messageSection: {
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  messageText: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  ctaButton: {
    width: "100%",
    borderRadius: 16,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    textAlign: "center",
  },
});

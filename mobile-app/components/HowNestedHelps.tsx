import { Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface TimelineStep {
  number: number;
  title: string;
  subtitle: string;
  backgroundColor: string;
  borderColor: string;
}

const timelineSteps: TimelineStep[] = [
  {
    number: 1,
    title: "We help you estimate future costs",
    subtitle: "And update you if anything changes.",
    backgroundColor: "#FCE7F3",
    borderColor: "#F9A8D4",
  },
  {
    number: 2,
    title: "We construct investment plan for your goal",
    subtitle: "And help you stick to the plan.",
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
  },
  {
    number: 3,
    title: "We build a customized portfolio",
    subtitle: "Tailored to your goal and timeline.",
    backgroundColor: "#D1FAE5",
    borderColor: "#86EFAC",
  },
  {
    number: 4,
    title: "We track your portfolio",
    subtitle: "And recommend rebalancing on timely basis.",
    backgroundColor: "#E9D5FF",
    borderColor: "#C4B5FD",
  },
  {
    number: 5,
    title: "We alert you when risks arise",
    subtitle: "If market conditions put your plan at risk.",
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
];

export default function HowNestedHelps() {
  const handleStartGoal = () => {
    // Navigate to goal creation screen
    router.push("/(tabs)/child/create");
  };

  return (
    <Layout style={styles.container}>
      <Layout style={[styles.content, { backgroundColor: "transparent" }]}>
        {/* Header */}
        <Text category="h4" style={styles.headerTitle}>
          How Nested Helps
        </Text>

        {/* Timeline Steps */}
        <Layout
          style={[styles.timelineContainer, { backgroundColor: "transparent" }]}
        >
          {/* Vertical Connecting Line */}
          <View style={styles.connectingLine} />

          {timelineSteps.map((step) => (
            <Layout
              key={step.number}
              style={[styles.stepContainer, { backgroundColor: "transparent" }]}
            >
              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step.backgroundColor,
                    borderColor: step.borderColor,
                  },
                ]}
              >
                <Text style={styles.stepNumber}>{step.number}</Text>
              </View>

              {/* Step Content */}
              <Layout
                style={[styles.stepContent, { backgroundColor: "transparent" }]}
              >
                <Text category="h6" style={styles.stepTitle}>
                  {step.title}
                </Text>
                <Text category="p1" style={styles.stepSubtitle}>
                  {step.subtitle}
                </Text>
              </Layout>
            </Layout>
          ))}
        </Layout>

        {/* Call-to-Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={handleStartGoal}
        >
          <Text style={styles.ctaButtonText}>Start Your First Goal</Text>
        </Pressable>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  headerTitle: {
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "bold",
    fontSize: 24,
  },
  timelineContainer: {
    flex: 1,
    marginTop: 12,
    position: "relative",
    paddingLeft: 0,
  },
  connectingLine: {
    position: "absolute",
    left: 23, // Center of circle (24 circle radius) - 1 (half line width)
    top: 24, // Start from center of first circle
    bottom: 24, // End at center of last circle
    width: 2,
    backgroundColor: "#E5E7EB",
    zIndex: 0,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    position: "relative",
    zIndex: 1,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    zIndex: 2,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    marginBottom: 6,
    lineHeight: 24,
    fontWeight: "bold",
    fontSize: 18,
    color: "#1F2937",
  },
  stepSubtitle: {
    color: "#6B7280",
    lineHeight: 20,
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: "#4F70F7",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
    shadowColor: "#4F70F7",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

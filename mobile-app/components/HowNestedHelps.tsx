import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface HowNestedHelpsProps {
  onStartGoal?: () => void;
}

interface TimelineStep {
  number: number;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  numberColor: string;
}

const timelineSteps: TimelineStep[] = [
  {
    number: 1,
    title: "We help you estimate future costs",
    subtitle: "And update you if anything changes.",
    color: "#EC4899",
    borderColor: "#F9A8D4",
    numberColor: "#FFFFFF",
  },
  {
    number: 2,
    title: "We construct investment plan for your goal",
    subtitle: "And help you stick to the plan.",
    color: "#3B82F6",
    borderColor: "#93C5FD",
    numberColor: "#FFFFFF",
  },
  {
    number: 3,
    title: "We build a customized portfolio",
    subtitle: "Tailored to your goal and timeline.",
    color: "#10B981",
    borderColor: "#86EFAC",
    numberColor: "#FFFFFF",
  },
  {
    number: 4,
    title: "We track your portfolio",
    subtitle: "And recommend rebalancing on timely basis.",
    color: "#8B5CF6",
    borderColor: "#C4B5FD",
    numberColor: "#FFFFFF",
  },
  {
    number: 5,
    title: "We alert you when risks arise",
    subtitle: "If market conditions put your plan at risk.",
    color: "#06B6D4",
    borderColor: "#BAE6FD",
    numberColor: "#FFFFFF",
  },
];

export default function HowNestedHelps({ onStartGoal }: HowNestedHelpsProps) {
  const insets = useSafeAreaInsets();

  const handleStartGoal = () => {
    onStartGoal?.();
    // You can add navigation logic here
    console.log("Start Your First Goal pressed");
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 20 },
      ]}
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedText style={styles.headerTitle}>How Nested Helps</ThemedText>

        {/* Timeline Steps */}
        <View style={styles.timelineContainer}>
          {timelineSteps.map((step, index) => (
            <View key={step.number} style={styles.stepContainer}>
              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step.color,
                    borderColor: step.borderColor,
                  },
                ]}
              >
                <Text style={[styles.stepNumber, { color: step.numberColor }]}>
                  {step.number}
                </Text>
              </View>

              {/* Connecting Line */}
              {index < timelineSteps.length - 1 && (
                <View
                  style={[
                    styles.connectingLine,
                    { backgroundColor: step.borderColor },
                  ]}
                />
              )}

              {/* Step Content */}
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedText style={styles.stepSubtitle}>
                  {step.subtitle}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Call-to-Action Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartGoal}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Start Your First Goal</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#1F2937",
  },
  timelineContainer: {
    flex: 1,
    marginBottom: 40,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    position: "relative",
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 1,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  connectingLine: {
    position: "absolute",
    left: 23,
    top: 48,
    width: 2,
    height: 64,
    zIndex: 0,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

import { Layout, Text } from "@ui-kitten/components";
import {
  BellRing,
  BrainCircuit,
  ChartPie,
  ChartSpline,
  ClipboardClock,
} from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";

interface TimelineStep {
  number: number;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  numberColor: string;
  icon: React.ReactNode;
}

const timelineSteps: TimelineStep[] = [
  {
    number: 1,
    title: "We help you estimate future costs",
    subtitle: "And update you if anything changes.",
    color: "#EC4899",
    borderColor: "#F9A8D4",
    numberColor: "#FFFFFF",
    icon: <ChartSpline />,
  },
  {
    number: 2,
    title: "We construct investment plan for your goal",
    subtitle: "And help you stick to the plan.",
    color: "#3B82F6",
    borderColor: "#93C5FD",
    numberColor: "#FFFFFF",
    icon: <BrainCircuit />,
  },
  {
    number: 3,
    title: "We build a customized portfolio",
    subtitle: "Tailored to your goal and timeline.",
    color: "#10B981",
    borderColor: "#86EFAC",
    numberColor: "#FFFFFF",
    icon: <ChartPie />,
  },
  {
    number: 4,
    title: "We track your portfolio",
    subtitle: "And recommend rebalancing on timely basis.",
    color: "#8B5CF6",
    borderColor: "#C4B5FD",
    numberColor: "#FFFFFF",
    icon: <ClipboardClock />,
  },
  {
    number: 5,
    title: "We alert you when risks arise",
    subtitle: "If market conditions put your plan at risk.",
    color: "#06B6D4",
    borderColor: "#BAE6FD",
    numberColor: "#FFFFFF",
    icon: <BellRing />,
  },
];

export default function HowNestedHelps() {
  return (
    <Layout style={styles.container}>
      <Layout style={[styles.content, { backgroundColor: "transparent" }]}>
        {/* Header */}
        <Text category="h4">How Nested Helps</Text>

        {/* Timeline Steps */}
        <Layout
          style={[styles.timelineContainer, { backgroundColor: "transparent" }]}
        >
          {timelineSteps.map((step) => (
            <Layout
              key={step.number}
              style={[styles.stepContainer, { backgroundColor: "transparent" }]}
            >
              {/* Step Circle */}
              <Layout
                style={[
                  styles.stepCircle,
                  { backgroundColor: step.borderColor },
                ]}
              >
                {step.icon}
              </Layout>

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
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerTitle: {
    textAlign: "left",
    marginBottom: 40,
  },
  timelineContainer: {
    flex: 1,
    marginTop: 12,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    position: "relative",
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 1,
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
    marginBottom: 8,
    lineHeight: 24,
  },
  stepSubtitle: {
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
});

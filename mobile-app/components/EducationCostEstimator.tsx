import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HowNestedHelps from "./HowNestedHelps";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const { width } = Dimensions.get("window");

interface EducationCostEstimatorProps {
  onCourseSelect?: (course: string) => void;
  onCollegeSelect?: (college: string) => void;
  onTimelineChange?: (years: number) => void;
}

export default function EducationCostEstimator({
  onCourseSelect,
  onCollegeSelect,
  onTimelineChange,
}: EducationCostEstimatorProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [timeline, setTimeline] = useState<number>(10);
  const insets = useSafeAreaInsets();

  const handleTimelineChange = (value: number) => {
    setTimeline(value);
    onTimelineChange?.(value);
  };

  const handleStartGoal = () => {
    // Navigate to goal creation or home screen
    console.log("Navigate to goal creation");
  };

  const estimatedCost = Math.round(1.2 * (1 + timeline * 0.1)); // Simple calculation for demo

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
    >
      {/* Header Section */}
      <LinearGradient
        colors={["#F8F7FF", "#E8E3FF"]}
        style={[styles.headerSection, { paddingTop: 20 }]}
      >
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>
            Plan your child&apos;s future
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            DIY investing is risky when your child&apos;s dreams are at stake.
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Main Content Card */}
      <ThemedView style={styles.mainCard}>
        <View style={styles.cardContent}>
          {/* Title */}
          <ThemedText style={styles.cardTitle}>Estimate Future Cost</ThemedText>

          {/* Description */}
          <ThemedText style={styles.cardDescription}>
            With college fees on the rise, see how much you&apos;ll need to save
            for your child&apos;s dream education.
          </ThemedText>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownField}>
              <Text style={styles.dropdownPlaceholder}>
                Select target course
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <ThemedText style={styles.orText}>OR</ThemedText>

            <TouchableOpacity style={styles.dropdownField}>
              <Text style={styles.dropdownPlaceholder}>
                Select dream college
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Timeline Slider */}
          <View style={styles.sliderContainer}>
            <ThemedText style={styles.sliderLabel}>
              Select timeline:{" "}
              <Text style={styles.sliderValue}>{timeline} years</Text>
            </ThemedText>

            <View style={styles.sliderWrapper}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderActiveTrack,
                    { width: `${(timeline - 1) * 4}%` },
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${(timeline - 1) * 4}%` },
                  ]}
                />
              </View>

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>+1 Yr</Text>
                <Text style={styles.sliderLabelText}>+25 Yrs</Text>
              </View>
            </View>

            {/* Timeline buttons */}
            <View style={styles.timelineButtons}>
              {[1, 5, 10, 15, 20, 25].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.timelineButton,
                    timeline === year && styles.timelineButtonActive,
                  ]}
                  onPress={() => handleTimelineChange(year)}
                >
                  <Text
                    style={[
                      styles.timelineButtonText,
                      timeline === year && styles.timelineButtonTextActive,
                    ]}
                  >
                    {year}Y
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cost Projection Display */}
          <View style={styles.costProjectionCard}>
            <View style={styles.chartIconContainer}>
              <Ionicons name="trending-up" size={24} color="#2563EB" />
            </View>
            <ThemedText style={styles.chartDescription}>
              Interactive cost projection chart
            </ThemedText>
            <View style={styles.estimatedCostContainer}>
              <Text style={styles.estimatedCostText}>
                ₹{estimatedCost}Cr estimated cost
              </Text>
            </View>
          </View>
        </View>
      </ThemedView>

      <Layout style={{ flex: 1, marginTop: 20, marginHorizontal: 20 }}>
        <HowNestedHelps onStartGoal={handleStartGoal} />
      </Layout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1F2937",
  },
  cardDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 32,
  },
  dropdownField: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#6B7280",
  },
  orText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  sliderValue: {
    color: "#2563EB",
    fontWeight: "600",
  },
  sliderWrapper: {
    marginBottom: 16,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    position: "relative",
    marginBottom: 8,
  },
  sliderActiveTrack: {
    height: 8,
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2563EB",
    position: "absolute",
    top: -8,
    marginLeft: -12,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#6B7280",
  },
  timelineButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  timelineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timelineButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  timelineButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  timelineButtonTextActive: {
    color: "#FFFFFF",
  },
  costProjectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  chartDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  estimatedCostContainer: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  estimatedCostText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
});

import { useEducation } from "@/hooks/useEducation";
import { Education } from "@/types/education";
import { formatCurrency } from "@/utils/formatters";
import { calculateFutureCost } from "@/utils/goalForm";
import React, { useRef, useState } from "react";
import { PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";
import SuperFDCard from "./SuperFDCard";
import { SearchableDropdown } from "./ui/SearchableDropdown";

interface EducationCostEstimatorProps {
  onCourseSelect?: (course: string) => void;
  onCollegeSelect?: (college: string) => void;
  onTimelineChange?: (years: number) => void;
  onInvestNowPress?: () => void;
}

export default function EducationCostEstimator({
  onCourseSelect,
  onCollegeSelect,
  onTimelineChange,
  onInvestNowPress,
}: EducationCostEstimatorProps) {
  const [selectedCourse, setSelectedCourse] = useState<Education | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<Education | null>(
    null
  );
  const [timeline, setTimeline] = useState<number>(10);
  const sliderTrackRef = useRef<View>(null);
  const sliderLayout = useRef({ width: 0, pageX: 0 });
  const { courses, institutions } = useEducation();

  const MIN_YEARS = 1;
  const MAX_YEARS = 25;

  const handleCourseSelect = (course: Education) => {
    setSelectedCourse(course);
    setSelectedCollege(null); // Clear college when course is selected
    onCourseSelect?.(course.name);
  };

  const handleCollegeSelect = (college: Education) => {
    setSelectedCollege(college);
    setSelectedCourse(null); // Clear course when college is selected
    onCollegeSelect?.(college.name);
  };

  const updateTimeline = (value: number) => {
    const newValue = Math.max(
      MIN_YEARS,
      Math.min(MAX_YEARS, Math.round(value))
    );
    setTimeline(newValue);
    onTimelineChange?.(newValue);
  };

  const getTimelineFromPageX = (pageX: number) => {
    if (sliderLayout.current.width === 0) return timeline;
    const relativeX = pageX - sliderLayout.current.pageX;
    const percentage = Math.max(
      0,
      Math.min(100, (relativeX / sliderLayout.current.width) * 100)
    );
    const years = MIN_YEARS + (percentage / 100) * (MAX_YEARS - MIN_YEARS);
    return years;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Handle tap/drag start on track
        const pageX = evt.nativeEvent.pageX;
        const newTimeline = getTimelineFromPageX(pageX);
        updateTimeline(newTimeline);
      },
      onPanResponderMove: (evt) => {
        // Handle dragging
        const pageX = evt.nativeEvent.pageX;
        const newTimeline = getTimelineFromPageX(pageX);
        updateTimeline(newTimeline);
      },
      onPanResponderRelease: () => {
        // Release handling if needed
      },
    })
  ).current;

  const sliderPercentage =
    ((timeline - MIN_YEARS) / (MAX_YEARS - MIN_YEARS)) * 100;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Invest In Super FD Promotion Card */}
      <SuperFDCard
        onPress={() => {
          // Handle card press if needed
        }}
        onInvestNowPress={() => {
          onInvestNowPress?.();
        }}
      />

      {/* Plan Your Child's Future Section */}
      <View style={styles.planSection}>
        <Text style={styles.planTitle}>Plan your child&apos;s future</Text>
        <Text style={styles.planSubtext}>
          Start today. Secure tomorrow. Get a portfolio designed just for your
          child&apos;s dreams.
        </Text>
      </View>

      {/* Estimate Future Cost Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.cardTitle}>Estimate Future Cost</Text>

          {/* Description */}
          <Text style={styles.cardDescription}>
            With college fees on the rise, see how much you&apos;ll need to save
            for your child&apos;s dream education.
          </Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <SearchableDropdown
              data={courses}
              labelKey="name"
              valueKey="id"
              placeholder="Select target course"
              searchPlaceholder="Search courses..."
              onSelect={handleCourseSelect}
              selectedValue={selectedCourse}
            />

            <View style={styles.orPillContainer}>
              <View style={styles.orPill}>
                <Text style={styles.orPillText}>OR</Text>
              </View>
            </View>

            <SearchableDropdown
              data={institutions}
              labelKey="name"
              valueKey="id"
              placeholder="Select dream college"
              searchPlaceholder="Search colleges..."
              onSelect={handleCollegeSelect}
              selectedValue={selectedCollege}
            />
          </View>

          {/* Timeline Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Select timeline:{" "}
              <Text style={styles.sliderValue}>{timeline} years</Text>
            </Text>

            <View style={styles.sliderWrapper}>
              <View
                ref={sliderTrackRef}
                style={styles.sliderTrack}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  sliderTrackRef.current?.measure(
                    (x, y, w, h, pageX, pageY) => {
                      sliderLayout.current = { width: width, pageX: pageX };
                    }
                  );
                }}
                {...panResponder.panHandlers}
              >
                <View
                  style={[
                    styles.sliderActiveTrack,
                    { width: `${sliderPercentage}%` },
                  ]}
                />
                <View
                  style={[styles.sliderThumb, { left: `${sliderPercentage}%` }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                />
              </View>

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>+1 Yr</Text>
                <Text style={styles.sliderLabelText}>+25 Yrs</Text>
              </View>
            </View>
          </View>

          {/* Cost Projection Display */}
          {(selectedCourse || selectedCollege) && (
            <EstimatedCostCard
              education={selectedCourse || (selectedCollege as Education)}
              timeline={timeline}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const EstimatedCostCard = ({
  education,
  timeline,
}: {
  education: Education;
  timeline: number;
}) => {
  const targetYear = new Date().getFullYear() + timeline;
  const estimatedCost = calculateFutureCost(education, targetYear);

  return (
    <View style={styles.costProjectionCard}>
      <View style={styles.estimatedCostContainer}>
        <Text style={styles.estimatedCostText}>
          {formatCurrency(estimatedCost)} in {timeline} years
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  // Plan Section Styles
  planSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  planSubtext: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  // Main Card Styles
  mainCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  orPillContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  orPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  orPillText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 16,
  },
  sliderValue: {
    color: "#1F2937",
    fontWeight: "600",
  },
  sliderWrapper: {
    marginBottom: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#E0E7FF",
    borderRadius: 3,
    position: "relative",
    marginBottom: 8,
  },
  sliderActiveTrack: {
    height: 6,
    backgroundColor: "#3B82F6",
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    position: "absolute",
    top: -7,
    marginLeft: -10,
    zIndex: 10,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomIconContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  bottomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  bottomIconArrow: {
    marginLeft: -6,
  },
  // Cost Projection Card (kept for functionality)
  costProjectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
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

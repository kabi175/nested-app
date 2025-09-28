import EducationCostEstimator from "@/components/EducationCostEstimator";
import InvestmentLandingScreen from "@/components/InvestmentLandingScreen";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const handleCourseSelect = (course: string) => {
    console.log("Selected course:", course);
  };

  const handleCollegeSelect = (college: string) => {
    console.log("Selected college:", college);
  };

  const handleTimelineChange = (years: number) => {
    console.log("Timeline changed to:", years, "years");
  };

  const handleExploreStrategy = (strategy: string) => {
    console.log("Explore strategy:", strategy);
    // Navigate to strategy details or investment flow
  };

  const handleLearnMore = () => {
    console.log("Learn more pressed");
    // Navigate to learn more section or FAQ
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Existing Education Cost Estimator */}
        <EducationCostEstimator
          onCourseSelect={handleCourseSelect}
          onCollegeSelect={handleCollegeSelect}
          onTimelineChange={handleTimelineChange}
        />

        {/* New Investment Landing Section */}
        <InvestmentLandingScreen
          onExploreStrategy={handleExploreStrategy}
          onLearnMore={handleLearnMore}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  scrollContainer: {
    flex: 1,
  },
});

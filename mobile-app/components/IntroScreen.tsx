import HaveQuestions from "@/components/HaveQuestions";
import HowNestedHelps from "@/components/HowNestedHelps";
import KnowMore from "@/components/KnowMore";
import NestedFooter from "@/components/NestedFooter";
import ShareApp from "@/components/ShareApp";
import WhatParentsSay from "@/components/WhatParentsSay";
import WhyParentTrustUs from "@/components/WhyParentTrustUs";
import { useUser } from "@/hooks/useUser";
import { Divider, Layout, Text } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import React, { useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EducationCostEstimator from "./EducationCostEstimator";

export default function NestedIntro() {
  const { data: user } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const superFDListYPosition = useRef<number>(0);
  const layoutYPosition = useRef<number>(0);

  const handleScrollToSuperFD = () => {
    if (scrollViewRef.current && superFDListYPosition.current >= 0) {
      const totalY = layoutYPosition.current + superFDListYPosition.current;
      scrollViewRef.current.scrollTo({
        y: Math.max(0, totalY - 20), // Small offset for better visibility
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="auto" backgroundColor="#FFFFFF" />

      <Layout style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text category="h6" style={styles.greeting}> Hello, {user?.firstName} 👋 </Text>
          <EducationCostEstimator onInvestNowPress={handleScrollToSuperFD} />
          <Layout
            style={styles.content}
            onLayout={(event) => {
              layoutYPosition.current = event.nativeEvent.layout.y;
            }}
          >
            <HowNestedHelps />
            <Divider />

            {/* <View
              onLayout={(event) => {
                superFDListYPosition.current = event.nativeEvent.layout.y;
              }}
            >
              <SuperFDSection />
            </View> */}

            <KnowMore />
            <Divider />
            <WhyParentTrustUs />
            <Divider />

            {/* <LaunchingSoon />
            <Divider /> */}

            <WhatParentsSay />
            <Divider />

            <ShareApp />
            <Divider />

            <HaveQuestions />
            <Divider />

            <NestedFooter />

            {/* New Investment Landing Section */}
            {/* <InvestmentLandingScreen
          onExploreStrategy={handleExploreStrategy}
          onLearnMore={handleLearnMore}
        /> */}
          </Layout>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  container: {
    height: "100%",
    width: "100%",
    flex: 1,
    paddingBottom: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  greeting: {
    paddingHorizontal: 20,
  },
});

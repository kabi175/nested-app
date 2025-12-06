import HowNestedHelps from "@/components/HowNestedHelps";
import KnowMore from "@/components/KnowMore";
import NestedFooter from "@/components/NestedFooter";
import ShareApp from "@/components/ShareApp";
import WhatParentsSay from "@/components/WhatParentsSay";
import WhyParentTrustUs from "@/components/WhyParentTrustUs";
import { useAuth } from "@/hooks/auth";
import { Divider, Layout, Text } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EducationCostEstimator from "./EducationCostEstimator";

export default function NestedIntro() {
  const auth = useAuth();
  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="auto" backgroundColor="#FFFFFF" />

      <Layout style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text category="h6"> Hello, {auth.user?.displayName} </Text>
          <EducationCostEstimator />
          <Layout style={styles.content}>
            <HowNestedHelps />
            <Divider />

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
});

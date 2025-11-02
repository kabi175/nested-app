import HowNestedHelps from "@/components/HowNestedHelps";
import KnowMore from "@/components/KnowMore";
import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestedIntro() {
  const handleStartGoal = () => {
    router.push("/estimate-cost");
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="auto" backgroundColor="#FFFFFF" />

      <Layout style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Layout style={styles.content}>
            <Text category="h3">Secure your child’s future</Text>
            <Text category="p1">
              Build a custom portfolio for their college expenses
            </Text>

            <HowNestedHelps />
            <Divider />

            <KnowMore />
            <Divider />

            {/* New Investment Landing Section */}
            {/* <InvestmentLandingScreen
          onExploreStrategy={handleExploreStrategy}
          onLearnMore={handleLearnMore}
        /> */}
          </Layout>
        </ScrollView>
        <Button onPress={handleStartGoal}>
          <Text category="h4">Estimate Future Cost</Text>
        </Button>
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
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
});

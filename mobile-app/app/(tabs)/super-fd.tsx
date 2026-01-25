import SuperFDSection, { SuperFDListHeader } from "@/components/SuperFDList";
import { ThemedText } from "@/components/ThemedText";
import {
  PortfolioSummaryCard
} from "@/components/goal";
import { useSuperFDGoals } from "@/hooks/useGoals";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuperFDScreen() {
  const { data: goals, isLoading: goalsLoading } = useSuperFDGoals();

  const isLoading = goalsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>Loading goals...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const currentValue =
    goals?.reduce((sum, goal) => sum + goal.currentAmount, 0) || 0;
  // For now, using currentValue as invested (can be updated when invested field is available)
  // In a real scenario, invested would be tracked separately
  const invested = currentValue * 0.88; // Approximate for demo - should come from API

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" backgroundColor="#F8F7FF" />
        <SuperFDListHeader />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <>
            <View style={styles.contentContainer}>
              {currentValue > 0 && (
                <PortfolioSummaryCard
                  currentValue={currentValue}
                  investedAmount={invested}
                  returnsAmount={currentValue - invested}
                />
              )}

              <SuperFDSection showHeader={false} />

            </View>
          </>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  investMoreButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
});

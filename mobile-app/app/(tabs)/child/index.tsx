import { ThemedText } from "@/components/ThemedText";
import {
  EmptyGoalState,
  GoalHeader,
  GoalsList,
  TotalSavedCard,
} from "@/components/goal";
import { useChildren } from "@/hooks/useChildren";
import { useGoals } from "@/hooks/useGoals";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalScreen() {
  const { data: children, isLoading: childrenLoading } = useChildren();
  const { data: goals, isLoading: goalsLoading } = useGoals();

  const handleCreateChild = useCallback(() => {
    router.push("/child/create");
  }, []);

  const handleCreateGoal = () => {
    if (firstChild) {
      router.push(`/child/${firstChild.id}/goal/create`);
    }
  };

  const isLoading = childrenLoading || goalsLoading;
  const hasChildren = Boolean(children && children.length > 0);
  const hasGoals = Boolean(goals && goals.length > 0);
  const firstChild = hasChildren && children ? children[0] : null;

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

  const totalSaved =
    goals?.reduce((sum, goal) => sum + goal.currentAmount, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <GoalHeader onAddGoal={handleCreateGoal} />

        {hasGoals && goals ? (
          <View style={styles.contentContainer}>
            <TotalSavedCard totalAmount={totalSaved} />
            <GoalsList goals={goals} />
          </View>
        ) : (
          <EmptyGoalState
            hasChildren={hasChildren}
            firstChild={firstChild}
            onCreateChild={handleCreateChild}
            onCreateGoal={handleCreateGoal}
          />
        )}
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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

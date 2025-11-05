import { ThemedText } from "@/components/ThemedText";
import {
  EmptyGoalState,
  GoalsList,
  PortfolioSummaryCard,
} from "@/components/goal";
import { useChildren } from "@/hooks/useChildren";
import { useGoals } from "@/hooks/useGoals";
import { router } from "expo-router";
import { Bell, MoreVertical } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalScreen() {
  const { data: children, isLoading: childrenLoading } = useChildren();
  const { data: goals, isLoading: goalsLoading } = useGoals();

  const isLoading = childrenLoading || goalsLoading;
  const hasChildren = Boolean(children && children.length > 0);
  const hasGoals = Boolean(goals && goals.length > 0);
  const firstChild = hasChildren && children ? children[0] : null;

  const handleCreateChild = useCallback(() => {
    router.push("/child/create");
  }, []);

  const handleCreateGoal = useCallback(() => {
    if (firstChild) {
      router.push(`/child/${firstChild.id}/goal/create`);
    }
  }, [firstChild]);

  const handleInvestMore = useCallback(() => {
    if (hasGoals && goals && goals.length > 0) {
      // Navigate to first goal or create new goal
      if (firstChild) {
        router.push(`/child/${firstChild.id}/goal/create`);
      }
    } else {
      handleCreateGoal();
    }
  }, [hasGoals, goals, firstChild, handleCreateGoal]);

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
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Portfolio</ThemedText>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, styles.lastIconButton]}>
            <MoreVertical size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasGoals && goals ? (
          <>
            <View style={styles.contentContainer}>
              <PortfolioSummaryCard
                currentValue={currentValue}
                invested={invested}
              />
              <GoalsList goals={goals} />
            </View>
            <TouchableOpacity
              style={styles.investMoreButton}
              onPress={handleInvestMore}
            >
              <ThemedText style={styles.investMoreButtonText}>
                Invest More
              </ThemedText>
            </TouchableOpacity>
          </>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#F8F7FF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    marginLeft: 16,
  },
  lastIconButton: {
    marginLeft: 12,
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
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  investMoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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

import { DeleteGoalModal } from "@/components/goal/DeleteGoalModal";
import GoalValueCard from "@/components/v2/GoalValueCard";
import GoalFooter from "@/components/v2/goal/GoalFooter";
import GoalHeader from "@/components/v2/goal/GoalHeader";
import GoalHoldingsList from "@/components/v2/goal/GoalHoldingsList";
import GoalSipCard from "@/components/v2/goal/GoalSipCard";
import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { useGoal } from "@/hooks/useGoal";
import { usePortfolioHoldings } from "@/hooks/usePortfolio";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const secureFDTitles = ["gold-silver-basket", "secure-money", "grow-money"];

export default function GoalDetailScreen() {
  const { goal_id } = useLocalSearchParams<{ goal_id: string }>();
  const { data: goal, isLoading: goalLoading } = useGoal(goal_id);
  const { data: holdings, isLoading: holdingsLoading } = usePortfolioHoldings(goal_id);
  const deleteGoalMutation = useDeleteGoal();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const portfolioSummary = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return { currentValue: 0, investedAmount: 0 };
    }
    const currentValue = holdings.reduce((sum, h) => sum + (Number(h.current_value) || 0), 0);
    const investedAmount = holdings.reduce((sum, h) => sum + (Number(h.invested_amount) || 0), 0);
    return {
      currentValue: isNaN(currentValue) ? 0 : currentValue,
      investedAmount: isNaN(investedAmount) ? 0 : investedAmount,
    };
  }, [holdings]);

  const handleDeleteConfirm = async () => {
    try {
      await deleteGoalMutation.mutateAsync({ goalId: goal_id });
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete goal. Please try again.", [{ text: "OK" }]);
    }
  };

  const handleAddLumpsum = () => {
    if (goal == null) return;
    if (secureFDTitles.includes(goal.basket.title)) {
      router.push(`/basket?type=${goal.basket.title}`);
      return;
    }

    router.push({
      pathname: "goal/[goal_id]/top-up",
      params: { goal_id },
    });
  };

  const goalTitle = (() => {
    if (goal?.child?.name) {
      return `${goal?.child.name}'s fund`
    }
    return goal?.title || "Goal";
  })()
  const goalSubtitle = [
    goal?.education?.name ?? goal?.basket?.title ?? "",
    goal?.targetDate ? new Date(goal.targetDate).getFullYear() : "",
  ]
    .filter(Boolean)
    .join(" • ");

  if (goalLoading || holdingsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <GoalHeader title={goalTitle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2848F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <GoalHeader title={goalTitle} subtitle={goalSubtitle || undefined} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GoalValueCard
          currentFundValue={portfolioSummary.currentValue}
          investedAmount={portfolioSummary.investedAmount}
          goalAmount={goal?.targetAmount ?? 0}
        />

        {goal?.monthlySip ? (
          <GoalSipCard
            monthlySip={goal.monthlySip}
            nextSipDate={goal.nextSipDate}
            stepUpAmount={goal.basket.min_step_up}
          />
        ) : null}

        <GoalHoldingsList goalId={goal_id} holdings={holdings || []} />
      </ScrollView>

      <GoalFooter
        onAddLumpsum={handleAddLumpsum}
        onEditSip={() => {
          router.push({
            pathname: "goal/[goal_id]/edit-sip",
            params: { goal_id, sip_order_id: goal?.sipOrderId ?? "" },
          });
        }}
      />

      <DeleteGoalModal
        visible={showDeleteModal}
        goal={goal || null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isSubmitting={deleteGoalMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
});

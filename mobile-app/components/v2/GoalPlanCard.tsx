import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

import ChildPlanCard from "@/components/v2/ChildPlanCard";
import { useChild } from "@/hooks/useChildren";
import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { Goal } from "@/types/investment";
import { formatIndianCompact } from "@/utils/formatters";

function getAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

function formatSipDate(date: Date): string {
  const d = new Date(date);
  const month = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  return `${d.getDate()} ${month}`;
}

export default function GoalPlanCard({ goal }: { goal: Goal }) {
  const { data: child } = useChild(goal.childId);
  const { mutate: deleteGoal } = useDeleteGoal();

  const isInvestmentMade =
    goal.currentAmount > 0 ||
    (goal.nextSipAmount != null && goal.nextSipAmount > 0);

  function onPressGoalCard() {
    if (isInvestmentMade) {
      router.push(`/goal/${goal.id}`);
      return;
    }
    if (goal.education) {
      router.push({
        pathname: "/education/[goal_id]/planner",
        params: { goal_id: goal.id },
      });
      return;
    }
    router.push({
      pathname: "/child/[child_id]/[goal_id]/planner",
      params: { child_id: child?.id, goal_id: goal.id },
    });
  }

  function onDeleteGoal() {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGoal({ goalId: goal.id }),
      },
    ]);
  }

  return (
    <ChildPlanCard
      childName={child?.firstName ?? "—"}
      childAge={child ? getAge(child.dateOfBirth) : 0}
      educationId={goal.education?.id}
      collegeType={goal.education?.name}
      goalYear={new Date(goal.targetDate).getFullYear()}
      goalAmount={`₹${formatIndianCompact(goal.targetAmount)}`}
      savedAmount={`₹${formatIndianCompact(goal.currentAmount)}`}
      savedFraction={goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0}
      nextSipAmount={goal.nextSipAmount != null ? `₹${formatIndianCompact(goal.nextSipAmount)}` : null}
      nextSipDate={goal.nextSipDate != null ? formatSipDate(goal.nextSipDate) : null}
      showDelete={!isInvestmentMade}
      actionLabel={goal.currentAmount === 0 ? "Start Saving Instantly ⚡" : undefined}
      onPressAction={goal.currentAmount === 0 ? onPressGoalCard : undefined}
      onPressDelete={onDeleteGoal}
      onPress={onPressGoalCard}
    />
  );
}

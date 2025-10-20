import type { Goal } from "@/types/user";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GoalCard } from "./GoalCard";

interface GoalsListProps {
  goals: Goal[];
}

export function GoalsList({ goals }: GoalsListProps) {
  return (
    <View style={styles.goalsContainer}>
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  goalsContainer: {
    marginTop: 15,
    // Container styles handled by parent
  },
});

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { Child } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface EmptyGoalStateProps {
  hasChildren: boolean;
  firstChild: Child | null;
  onCreateChild: () => void;
  onCreateGoal: () => void;
}

export function EmptyGoalState({
  hasChildren,
  firstChild,
  onCreateChild,
  onCreateGoal,
}: EmptyGoalStateProps) {
  return (
    <ThemedView style={styles.mainCard}>
      <View style={styles.cardContent}>
        <ThemedText style={styles.sectionTitle}>
          {hasChildren
            ? `Create Goal for ${firstChild?.firstName}`
            : "Start Planning"}
        </ThemedText>

        <ThemedText style={styles.description}>
          {hasChildren
            ? `Create educational goals for ${firstChild?.firstName} and start investing towards their future.`
            : "Create educational goals for your children and start investing towards their future."}
        </ThemedText>

        <TouchableOpacity
          style={styles.createChildButton}
          onPress={() => (hasChildren ? onCreateGoal() : onCreateChild())}
        >
          {hasChildren ? (
            <>
              <Plus size={24} color="#FFFFFF" />
              <ThemedText style={styles.createChildButtonText}>
                Create Goal for {firstChild?.firstName}
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          ) : (
            <>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
              <ThemedText style={styles.createChildButtonText}>
                Start Planning Your Child&apos;s Future
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 32,
  },
  createChildButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  createChildButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 12,
  },
});

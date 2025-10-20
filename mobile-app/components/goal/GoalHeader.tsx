import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface GoalHeaderProps {
  onAddGoal?: () => void;
}

export function GoalHeader({ onAddGoal }: GoalHeaderProps) {
  return (
    <View style={styles.headerSection}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.headerTitle}>Educational Goals</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Building your future, one goal at a time
          </ThemedText>
        </View>
        {onAddGoal && (
          <TouchableOpacity style={styles.addButton} onPress={onAddGoal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: "#F8F7FF",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
});

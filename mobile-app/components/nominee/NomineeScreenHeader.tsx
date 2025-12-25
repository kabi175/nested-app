import { Button, Text } from "@ui-kitten/components";
import { Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeScreenHeaderProps {
  onAddPress: () => void;
  disabled?: boolean;
}

export function NomineeScreenHeader({
  onAddPress,
  disabled = false,
}: NomineeScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text category="h4" style={styles.title}>
          Nominee Details
        </Text>
        <Text category="s2" style={styles.subtitle}>
          Manage your investment nominees
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, disabled && styles.addButtonDisabled]}
        onPress={onAddPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
});


import { Button, Text } from "@ui-kitten/components";
import { Plus, Users } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface NomineeEmptyStateProps {
  onAddPress: () => void;
}

export function NomineeEmptyState({ onAddPress }: NomineeEmptyStateProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Users size={48} color="#7C3AED" />
        </View>
      </View>
      <Text category="h6" style={styles.title}>
        No nominees added yet
      </Text>
      <Text category="p1" style={styles.description}>
        Add your first nominee to ensure your investments are passed on
        according to your wishes.
      </Text>
      <Button
        style={styles.addButton}
        status="primary"
        onPress={onAddPress}
        accessoryLeft={() => <Plus size={20} color="#FFFFFF" />}
      >
        Add Your First Nominee
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});


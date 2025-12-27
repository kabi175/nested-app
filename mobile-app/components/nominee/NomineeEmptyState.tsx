import { useUser } from "@/hooks/useUser";
import { Button, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { ArrowLeft, Plus, Users } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeEmptyStateProps {
  onAddPress: () => void;
  onOptOut?: () => void;
}

export function NomineeEmptyState({
  onAddPress,
  onOptOut,
}: NomineeEmptyStateProps) {
  const { data: user } = useUser();
  const hasOptedOut = user?.nominee_status === "opt_out";

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
        {hasOptedOut
          ? "You have opted out of nominee nomination"
          : "No nominees added yet"}
      </Text>
      <Text category="p1" style={styles.description}>
        {hasOptedOut
          ? "You can always add it later."
          : "Add your first nominee to ensure your investments are passed on according to your wishes."}
      </Text>
      <Button
        style={styles.addButton}
        status="primary"
        onPress={onAddPress}
        accessoryLeft={() => <Plus size={20} color="#FFFFFF" />}
      >
        {hasOptedOut ? "Add Nominee" : "Add Your First Nominee"}
      </Button>
      {hasOptedOut ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#6B7280" />
          <Text category="p1" style={styles.backButtonText}>
            Back
          </Text>
        </TouchableOpacity>
      ) : (
        onOptOut && (
          <Button
            style={styles.addLaterButton}
            appearance="ghost"
            status="basic"
            onPress={onOptOut}
          >
            Opt out
          </Button>
        )
      )}
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
    marginBottom: 12,
  },
  addLaterButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 16,
  },
});

import { Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { ChevronLeft, Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeScreenHeaderProps {
  onAddPress: () => void;
  showAddMoreButton?: boolean;
}

export function NomineeScreenHeader({
  onAddPress,
  showAddMoreButton = true,
}: NomineeScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color="#000000" />
      </TouchableOpacity>
      <Text category="h4" style={styles.title}>
        Nominee Management
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.7}
        disabled={!showAddMoreButton}
      >
        <Plus size={24} color={!showAddMoreButton ? "#9CA3AF" : "#000000"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});

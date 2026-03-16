import BackButton from "@/components/v2/BackButton";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <BackButton onPress={() => router.back()} />
      <Text style={styles.title}>{"Nominee\nManagement"}</Text>
      {showAddMoreButton ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.7}
        >
          <Plus size={24} color="#000000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.addButton} />
      )}
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D0D0D",
    flex: 1,
    textAlign: "center",
    lineHeight: 30,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
      <TouchableOpacity style={styles.infoButton} activeOpacity={0.7}>
        <Ionicons name="information-circle-outline" size={24} color="#000000" />
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
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});

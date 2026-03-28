import BackButton from "@/components/v2/BackButton";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface GoalHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function GoalHeader({ title, subtitle, onBack }: GoalHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton onPress={onBack ?? (() => router.back())} />
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {/* Spacer to keep title centered */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  spacer: {
    width: 38,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8A8A9A",
    marginTop: 2,
    textAlign: "center",
  },
});

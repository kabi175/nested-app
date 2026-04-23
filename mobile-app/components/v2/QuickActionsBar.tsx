import { router } from "expo-router";
import { FileText, Pencil, Plus, UserRoundPlus } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUICK_ACTIONS = [
  { label: "Add Money", icon: Plus, route: "/child/select" as const },
  { label: "Edit plan", icon: Pencil, route: "/child/select" as const },
  { label: "Orders", icon: FileText, route: "/orders" as const },
  { label: "Add Child", icon: UserRoundPlus, route: "/child/create" as const },
];

export default function QuickActionsBar() {
  return (
    <View style={styles.row}>
      {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
        <TouchableOpacity
          key={label}
          style={styles.item}
          onPress={() => router.push(route)}
          activeOpacity={0.75}
        >
          <View style={styles.card}>
            <Icon size={24} color="#1A1A1A" strokeWidth={1.5} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
  item: {
    alignItems: "center",
    gap: 8,
  },
  card: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

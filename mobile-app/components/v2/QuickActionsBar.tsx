import { router } from "expo-router";
import { Baby, ChartColumnIncreasing, PiggyBank, ScrollText } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUICK_ACTIONS = [
  { label: "Add Money", icon: PiggyBank, route: "/child/select" as const },
  { label: "Edit plan", icon: ChartColumnIncreasing, route: "/child/select" as const },
  { label: "Orders", icon: ScrollText, route: "/orders" as const },
  { label: "Add Child", icon: Baby, route: "/child/create" as const },
];

export default function QuickActionsBar() {
  return (
    <View style={styles.row}>
      {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
        <TouchableOpacity
          key={label}
          style={styles.item}
          onPress={() => router.push(route)}
        >
          <View style={styles.iconCircle}>
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
    paddingVertical: 20,
    backgroundColor: "#FFFDF9",
  },
  item: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "rgba(244,244,244,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0,0,0,0.8)",
    textAlign: "center",
    letterSpacing: 0.24,
  },
});

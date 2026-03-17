import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PlannerMode = "target" | "sip";

interface ModeToggleProps {
  mode: PlannerMode;
  onChange: (mode: PlannerMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.option} onPress={() => onChange("target")}>
        <View style={[styles.radio, mode === "target" && styles.radioActive]}>
          {mode === "target" && <View style={styles.radioDot} />}
        </View>
        <Text style={[styles.label, mode === "target" && styles.labelActive]}>
          Target Goal
        </Text>
      </Pressable>

      <Pressable style={styles.option} onPress={() => onChange("sip")}>
        <View style={[styles.radio, mode === "sip" && styles.radioActive]}>
          {mode === "sip" && <View style={styles.radioDot} />}
        </View>
        <Text style={[styles.label, mode === "sip" && styles.labelActive]}>
          Monthly SIP
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#C4C4C4",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#3137D5",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3137D5",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8A8A9A",
  },
  labelActive: {
    color: "#1D1E20",
  },
});

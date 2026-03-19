import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MenuRowProps {
  onPress?: () => void;
  left?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  titleColor?: string;
}

export function MenuRow({
  onPress,
  left,
  title,
  subtitle,
  right,
  titleColor = "#111827",
}: MenuRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {left}
      <View style={[styles.content, !left && styles.contentNoIcon]}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  contentNoIcon: {
    marginLeft: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});

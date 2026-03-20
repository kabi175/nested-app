import React from "react";
import { StyleSheet, View } from "react-native";

interface IconWrapperProps {
  children: React.ReactNode;
  bg?: string;
}

export function IconWrapper({ children, bg = "#F3F4F6" }: IconWrapperProps) {
  return (
    <View style={[styles.wrapper, { backgroundColor: bg }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

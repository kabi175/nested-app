import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface OutlineButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function OutlineButton({
  title,
  onPress,
  disabled = false,
}: OutlineButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => !disabled && setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      style={[
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[styles.label, disabled && styles.labelDisabled]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 55,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  } as ViewStyle,
  buttonPressed: {
    backgroundColor: "#F3F4F6",
  } as ViewStyle,
  buttonDisabled: {
    borderColor: "#E5E7EB",
  } as ViewStyle,
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  } as TextStyle,
  labelDisabled: {
    color: "#9CA3AF",
  } as TextStyle,
});

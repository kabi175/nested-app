import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  borderNormal: "#C4C4C4",
  borderPressed: "#A0A0A0",
  borderDisabled: "#E5E7EB",

  shadowNormal: "#C4C4C4",
  shadowPressed: "#A0A0A0",
  shadowDisabled: "#E5E7EB",

  bgNormal: "#FFFFFF",
  bgPressed: "#F8F8F8",
  bgDisabled: "#FAFAFA",

  textNormal: "#1A1A1A",
  textDisabled: "#9CA3AF",

  radius: 14,
  height: 55,
  shadowHeight: 4,
  shadowHeightPressed: 1,
} as const;

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

  const isDisabled = disabled;
  const isPressed = !isDisabled && pressed;

  const shadowH = isPressed ? T.shadowHeightPressed : T.shadowHeight;
  const pressShift = T.shadowHeight - T.shadowHeightPressed; // 3px

  const outerBorderColor = isDisabled
    ? T.borderDisabled
    : isPressed
      ? T.borderPressed
      : T.borderNormal;

  const innerBg = isDisabled
    ? T.bgDisabled
    : isPressed
      ? T.bgPressed
      : T.bgNormal;

  return (
    <View
      style={[
        styles.outer,
        {
          backgroundColor: outerBorderColor,
          height: T.height + shadowH,
          borderColor: outerBorderColor,
        },
      ]}
    >
      <Pressable
        onPressIn={() => { if (!isDisabled) setPressed(true); }}
        onPressOut={() => setPressed(false)}
        onPress={isDisabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        accessibilityLabel={title}
        style={[
          styles.inner,
          {
            backgroundColor: innerBg,
            transform: isPressed ? [{ translateY: pressShift }] : [],
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            isDisabled && styles.labelDisabled,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    width: "100%",
    borderRadius: T.radius,
    borderWidth: 1.5,
    overflow: "hidden",
  } as ViewStyle,

  inner: {
    width: "100%",
    height: T.height,
    borderRadius: T.radius,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  } as ViewStyle,

  label: {
    fontSize: 17,
    fontWeight: "600",
    color: T.textNormal,
    letterSpacing: 0.3,
  } as TextStyle,

  labelDisabled: {
    color: T.textDisabled,
  } as TextStyle,
});

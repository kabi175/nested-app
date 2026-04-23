import type { LucideProps } from "lucide-react-native";
import type { ComponentType } from "react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bgNormal: "#3137D5",
  bgPressed: "#2229B8",
  bgDisabled: "#C8CCEC",

  shadowNormal: "#1A1F9E",
  shadowPressed: "#141880",
  shadowDisabled: "#B0B4D8",

  textNormal: "#FFFFFF",
  textDisabled: "#A0A4CC",

  radius: 14,
  height: 55,
  shadowHeight: 5,   // outer wrapper peeks below the button
  shadowHeightPressed: 2,
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ButtonProps {
  /** Button label. Defaults to "Send OTP". */
  title?: string;
  disabled?: boolean;
  /** Show a spinner and lock interaction while an async action is in-flight. */
  loading?: boolean;
  onPress?: () => void;
  /** Optional icon rendered after the label. Pass a LucideIcon or a wrapper: `(props) => <ArrowRight {...props} strokeWidth={3} />` */
  icon?: ComponentType<Partial<LucideProps>>;
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * Outer shadow wrapper pattern:
 *  ┌─────────────────────┐  ← outer View (shadow colour, full radius)
 *  │  ┌───────────────┐  │
 *  │  │   Pressable   │  │  ← inner Pressable (button colour, same radius)
 *  │  └───────────────┘  │
 *  │  [shadow strip]     │  ← outer bg peeking below inner → no clipping!
 *  └─────────────────────┘
 *
 * On press, the inner Pressable shifts down via translateY,
 * "covering" more of the shadow strip → smaller visible shadow.
 */
export default function Button({
  title = "Send OTP",
  disabled = false,
  loading = false,
  onPress,
  icon: Icon,
}: ButtonProps) {
  // Loading counts as disabled for interaction purposes
  const isDisabled = disabled || loading;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => { if (!isDisabled) setPressed(true); };
  const handlePressOut = () => setPressed(false);

  const isPressed = !isDisabled && pressed;

  const shadowH = isPressed ? T.shadowHeightPressed : T.shadowHeight;
  const pressShift = T.shadowHeight - T.shadowHeightPressed; // = 3 px

  // Loading keeps the normal blue colours (action is in-flight, not unavailable)
  const outerBg = disabled ? T.shadowDisabled
    : isPressed ? T.shadowPressed
      : T.shadowNormal;

  const innerBg = disabled ? T.bgDisabled
    : isPressed ? T.bgPressed
      : T.bgNormal;

  return (
    // Outer wrapper: shadow colour + combined height (button + shadow strip)
    <View
      style={[
        styles.outer,
        {
          backgroundColor: outerBg,
          height: T.height + shadowH,
        },
      ]}
    >
      {/* Inner Pressable: button colour + shifts down on press */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={isDisabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={title}
        style={[
          styles.inner,
          {
            backgroundColor: innerBg,
            transform: isPressed ? [{ translateY: pressShift }] : [],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={T.textNormal} />
        ) : (
          <View style={styles.content}>
            <Text
              style={[
                styles.label,
                { color: disabled ? T.textDisabled : T.textNormal },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {Icon && (
              <Icon
                size={18}
                color={disabled ? T.textDisabled : T.textNormal}
                strokeWidth={2}
              />
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Outer shadow shell — same border radius, shadow colour as background
  outer: {
    width: "100%",
    borderRadius: T.radius,
    overflow: "hidden",   // clips inner perfectly to the rounded corners
  } as ViewStyle,

  // Inner button — sits flush at the top of the outer shell; shadow peeks below
  inner: {
    width: "100%",
    height: T.height,
    borderRadius: T.radius,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  } as ViewStyle,

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as ViewStyle,
  label: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  } as TextStyle,
});

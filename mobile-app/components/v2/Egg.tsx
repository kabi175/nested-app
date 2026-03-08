import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Ellipse, Defs, RadialGradient, Stop } from "react-native-svg";

// ─── Props ────────────────────────────────────────────────────────────────────
export interface EggProps {
  /** Fill colour of the egg. */
  color: string;
  /** Whether this egg is currently selected. */
  selected?: boolean;
  /** Called when the egg is tapped. */
  onPress?: () => void;
  /** Egg width. Default 70. */
  width?: number;
  /** Egg height. Default 90. */
  height?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Egg({
  color,
  selected = false,
  onPress,
  width = 70,
  height = 90,
}: EggProps) {
  // ── Floating idle animation ────────────────────────────────────────────────
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );
  }, []);

  // ── Selection bounce animation ─────────────────────────────────────────────
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      scale.value = withSequence(
        withSpring(1.08, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 180 })
      );
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    }
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
  }));

  // ── SVG egg shape ──────────────────────────────────────────────────────────
  // Classic egg: a taller ellipse with a slightly flattened bottom.
  // We achieve this with a main ellipse + a radial gradient highlight.
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 2; // slight padding
  const ry = height / 2 - 2;

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <RadialGradient
              id={`eggGrad-${color}`}
              cx="40%"
              cy="35%"
              rx="50%"
              ry="50%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
              <Stop offset="100%" stopColor={color} stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={`url(#eggGrad-${color})`}
          />
          {/* Subtle highlight ellipse for gloss effect */}
          <Ellipse
            cx={cx - rx * 0.15}
            cy={cy - ry * 0.22}
            rx={rx * 0.35}
            ry={ry * 0.25}
            fill="#FFFFFF"
            opacity={0.35}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

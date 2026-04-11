import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

export interface EggProps {
  color: string;
  selected?: boolean;
  onPress?: () => void;
  width?: number;
  height?: number;
  animated?: boolean;
}

export default function Egg({
  color,
  selected = false,
  onPress,
  width = 70,
  height = 90,
  animated = true,
}: EggProps) {
  // Gentle float up/down
  const floatY = useSharedValue(0);
  useEffect(() => {
    if (!animated) return;
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  // Bounce on selection
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!animated) return;
    scale.value = selected
      ? withSequence(
          withSpring(1.1, { damping: 5, stiffness: 200 }),
          withSpring(1,   { damping: 8, stiffness: 180 })
        )
      : withSpring(1, { damping: 10, stiffness: 150 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, animated]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }));

  // Egg path: pointed top, rounded bottom
  const w = width;
  const h = height;
  const d = [
    `M ${w / 2} 0`,
    `C ${w * 0.9} 0, ${w} ${h * 0.3}, ${w} ${h * 0.5}`,
    `C ${w} ${h * 0.8}, ${w * 0.7} ${h}, ${w / 2} ${h}`,
    `C ${w * 0.3} ${h}, 0 ${h * 0.8}, 0 ${h * 0.5}`,
    `C 0 ${h * 0.3}, ${w * 0.1} 0, ${w / 2} 0 Z`,
  ].join(" ");

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={style}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path d={d} fill={color} opacity={0.85} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

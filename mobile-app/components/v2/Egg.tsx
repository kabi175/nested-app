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
  }, [selected, animated]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius: width / 2,
            backgroundColor: color,
            opacity: 0.85,
          },
          style,
        ]}
      />
    </Pressable>
  );
}

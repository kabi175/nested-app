import React, { useCallback, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

interface AnimatedNestProps {
  width?: number;
  height?: number;
  /** Milliseconds each nest frame is shown. Default 300ms. */
  frameDuration?: number;
  onAnimationComplete?: () => void;
}

const NEST_FRAMES = [
  require("../../assets/images/v2/nest-animation/nest-frame-1.png"),
  require("../../assets/images/v2/nest-animation/nest-frame-2.png"),
  require("../../assets/images/v2/nest-animation/nest-frame-3.png"),
  require("../../assets/images/v2/nest-animation/nest-frame-4.png"),
];

const TOTAL_FRAMES = NEST_FRAMES.length;

export default function AnimatedNest({
  width = 220,
  height = 140,
  frameDuration = 300,
  onAnimationComplete,
}: AnimatedNestProps) {
  // React state drives the frame (guarantees a re-render for each frame)
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showEgg, setShowEgg] = useState(false);
  const hasRun = useRef(false);

  // Egg animation values
  const eggOpacity = useSharedValue(0);
  const eggScale = useSharedValue(0.8);

  // useFocusEffect fires ONLY when the screen is focused (transition done)
  useFocusEffect(
    useCallback(() => {
      // Prevent re-running if user navigates away and back
      if (hasRun.current) return;
      hasRun.current = true;

      // Chain timeouts for each frame step
      const timers: NodeJS.Timeout[] = [];

      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const t = setTimeout(() => {
          setCurrentFrame(i);

          // After settling on the last frame, trigger egg
          if (i === TOTAL_FRAMES - 1) {
            const eggTimer = setTimeout(() => {
              setShowEgg(true);
              eggOpacity.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.ease),
              });
              eggScale.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.ease),
              });
              onAnimationComplete?.();
            }, frameDuration);
            timers.push(eggTimer);
          }
        }, frameDuration * i);
        timers.push(t);
      }

      return () => {
        timers.forEach(clearTimeout);
      };
    }, [])
  );

  const animatedEggStyle = useAnimatedStyle(() => ({
    opacity: eggOpacity.value,
    transform: [{ scale: eggScale.value }],
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Egg Layer — only mounted after nest finishes */}
      {showEgg && (
        <Animated.Image
          source={require("../../assets/images/v2/onboarding/egg.png")}
          style={[styles.egg, animatedEggStyle]}
          resizeMode="contain"
        />
      )}

      {/* Active nest frame — simple swap, no stacking needed */}
      <Image
        source={NEST_FRAMES[currentFrame]}
        style={styles.nestFrame}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  egg: {
    width: "40%",
    height: "60%",
    position: "absolute",
    top: "10%",
    zIndex: 1,
  },
  nestFrame: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
});

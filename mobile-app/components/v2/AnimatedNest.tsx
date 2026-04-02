import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Egg from "./Egg";

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

const NEST_ASPECT = 388 / 188; // source frame aspect ratio
const EGG_W = 44;
const EGG_H = 58;

function getEggLayout(containerW: number, containerH: number) {
  const renderedNestH = containerW / NEST_ASPECT;
  const nestTop = (containerH - renderedNestH) / 2;
  return {
    eggLeft: containerW / 2 - EGG_W / 2,
    eggTop: nestTop + renderedNestH * 0.20 - EGG_H / 2,
  };
}

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
    transform: [{ scale: eggScale.value }, { rotate: "180deg" }],
  }));

  const { eggTop, eggLeft } = getEggLayout(width, height);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Active nest frame — simple swap, no stacking needed */}
      <Image
        source={NEST_FRAMES[currentFrame]}
        style={styles.nestFrame}
        resizeMode="contain"
      />

      {/* Egg Layer — only mounted after nest finishes */}
      {showEgg && (
        <Animated.View
          style={[styles.egg, { top: eggTop, left: eggLeft, width: EGG_W, height: EGG_H }, animatedEggStyle]}
        >
          <Egg color="#75b7ee" width={EGG_W} height={EGG_H} animated={false} />
        </Animated.View>
      )}
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
    position: "absolute",
    zIndex: 1,
  },
  nestFrame: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
});

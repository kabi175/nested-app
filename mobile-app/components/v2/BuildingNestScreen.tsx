import { InstrumentSans_600SemiBold, useFonts } from "@expo-google-fonts/instrument-sans";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// SVGs
import { StatusBar } from "expo-status-bar";
import LeafImage from "../../assets/images/v2/loading-screen/leaf.svg";
import NestImage from "../../assets/images/v2/loading-screen/nest.svg";
import BranchImage from "../../assets/images/v2/loading-screen/stick.svg";
import WindImage from "../../assets/images/v2/loading-screen/wind.svg";

export interface BuildingNestScreenProps {
  userName: string;
  statusText?: string;
  onComplete?: () => void;
}

export default function BuildingNestScreen({
  userName,
  statusText = "2,500+ funds filtered. One portfolio. Built for your child.",
  onComplete,
}: BuildingNestScreenProps) {
  const [fontsLoaded] = useFonts({
    InstrumentSans_600SemiBold,
  });

  // Entry Animations
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const nestOpacity = useSharedValue(0);
  const nestScale = useSharedValue(0.85);
  const subtitleOpacity = useSharedValue(0);

  // Floating Elements Opacities (for staggered entry)
  const floatOpacity1 = useSharedValue(0);
  const floatOpacity2 = useSharedValue(0);
  const floatOpacity3 = useSharedValue(0);
  const floatOpacity4 = useSharedValue(0);
  const floatOpacity5 = useSharedValue(0);
  const floatOpacity6 = useSharedValue(0);
  const floatOpacity7 = useSharedValue(0);

  // Continuous Nest Animation
  const nestFloatY = useSharedValue(0);
  const nestBreathScale = useSharedValue(1);

  // Subtitle Pulse Animation
  const subtitlePulseOpacity = useSharedValue(0.5);

  const startEntryAnimation = () => {
    // Title slides up & fades in (0ms)
    titleOpacity.value = withTiming(1, { duration: 600 });
    titleTranslateY.value = withTiming(0, { duration: 600 });

    // Nest fades & scales in (delay 200ms)
    nestOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    nestScale.value = withDelay(200, withTiming(1, { duration: 800 }));

    // Floating elements staggered fade (delay 400ms+)
    floatOpacity1.value = withDelay(400, withTiming(1, { duration: 600 }));
    floatOpacity2.value = withDelay(600, withTiming(1, { duration: 600 }));
    floatOpacity3.value = withDelay(800, withTiming(1, { duration: 600 }));
    floatOpacity4.value = withDelay(1000, withTiming(1, { duration: 600 }));
    floatOpacity5.value = withDelay(1200, withTiming(1, { duration: 600 }));
    floatOpacity6.value = withDelay(1400, withTiming(1, { duration: 600 }));
    floatOpacity7.value = withDelay(1600, withTiming(1, { duration: 600 }));

    // Subtitle fade in (delay 700ms)
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
  };

  const startContinuousAnimations = () => {
    // Nest Breathing (1.0 -> 1.03 -> 1.0) loop 3s
    nestBreathScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 }),
      ),
      -1,
      true,
    );

    // Nest Y Float (+-4px) loop 3s
    nestFloatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1500 }),
        withTiming(4, { duration: 1500 }),
      ),
      -1,
      true,
    );

    // Subtitle Pulse (0.5 -> 1.0 -> 0.5) loop 1.5s
    // Starts after its entry delay
    subtitlePulseOpacity.value = withDelay(
      1300,
      withRepeat(
        withSequence(
          withTiming(1.0, { duration: 750 }),
          withTiming(0.5, { duration: 750 }),
        ),
        -1,
        true,
      ),
    );
  };

  useEffect(() => {
    if (fontsLoaded) {
      startEntryAnimation();
      startContinuousAnimations();
    }
    // Simulate loading completion for testing if an onComplete is provided
    // In actual use, parent controls this lifecycle.
    /*
        if (onComplete) {
          const timer = setTimeout(() => {
            onComplete();
          }, 5000);
          return () => clearTimeout(timer);
        }
        */
  }, [fontsLoaded]);

  // Use this factory to create float elements to avoid massive duplication
  const createFloatAnimations = (
    delay: number,
    durationY: number,
    distanceY: number,
    distanceX: number,
    rotDeg: number,
  ) => {
    const transY = useSharedValue(0);
    const transX = useSharedValue(0);
    const rot = useSharedValue(0);
    const pulseFade = useSharedValue(1);

    useEffect(() => {
      transY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-distanceY, { duration: durationY }),
            withTiming(distanceY, { duration: durationY }),
          ),
          -1,
          true,
        ),
      );
      transX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(distanceX, { duration: durationY * 1.1 }),
            withTiming(-distanceX, { duration: durationY * 1.1 }),
          ),
          -1,
          true,
        ),
      );
      rot.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(rotDeg, { duration: durationY * 0.9 }),
            withTiming(-rotDeg, { duration: durationY * 0.9 }),
          ),
          -1,
          true,
        ),
      );
      pulseFade.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.7, { duration: durationY * 0.8 }),
            withTiming(1, { duration: durationY * 0.8 }),
          ),
          -1,
          true,
        ),
      );
    }, []);

    return { transY, transX, rot, pulseFade };
  };

  // Branch 1 (Top Left)
  const floatB1 = createFloatAnimations(0, 2500, 8, -4, 5);
  // Branch 2 (Bottom Right)
  const floatB2 = createFloatAnimations(400, 2800, 6, 5, 8);
  // Leaf 1 (Top Right)
  const floatL1 = createFloatAnimations(800, 2200, 7, 3, 6);
  // Leaf 2 (Bottom Left)
  const floatL2 = createFloatAnimations(1200, 2600, 9, -5, 7);
  // Leaf 3 (Mid Right)
  const floatL3 = createFloatAnimations(600, 2400, 6, 4, 5);

  const createSweepAnimations = (delay: number, duration: number) => {
    const sweepX = useSharedValue(-80);
    const sweepY = useSharedValue(0);
    const sweepOp = useSharedValue(0);
    const rot = useSharedValue(0);

    useEffect(() => {
      sweepX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-80, { duration: 0 }),
            withTiming(80, { duration }),
          ),
          -1,
          false,
        ),
      );

      sweepOp.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(0.6, { duration: duration * 0.3 }),
            withTiming(0.6, { duration: duration * 0.4 }),
            withTiming(0, { duration: duration * 0.3 }),
          ),
          -1,
          false,
        ),
      );

      sweepY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-8, { duration: duration / 2 }),
            withTiming(0, { duration: duration / 2 }),
          ),
          -1,
          false,
        ),
      );

      rot.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-5, { duration: 0 }),
            withTiming(3, { duration }),
          ),
          -1,
          false,
        ),
      );
    }, []);

    return { sweepX, sweepY, sweepOp, rot };
  };

  // Wind 1 (Left Side)
  const sweepW1 = createSweepAnimations(0, 1400);
  // Wind 2 (Top Right)
  const sweepW2 = createSweepAnimations(900, 1600);

  // Animated Styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const mainNestStyle = useAnimatedStyle(() => ({
    opacity: nestOpacity.value,
    transform: [
      { scale: nestScale.value * nestBreathScale.value },
      { translateY: nestFloatY.value },
    ],
  }));

  const floatElementStyle = (
    entryOp: Animated.SharedValue<number>,
    floatAnim: any,
    baseInitialRotation = 0,
    baseScale = 1,
  ) =>
    useAnimatedStyle(() => ({
      opacity: entryOp.value * floatAnim.pulseFade.value,
      transform: [
        { translateY: floatAnim.transY.value },
        { translateX: floatAnim.transX.value },
        { rotate: `${baseInitialRotation + floatAnim.rot.value}deg` },
        { scale: baseScale },
      ],
      position: "absolute",
    }));

  const sweepElementStyle = (
    entryOp: Animated.SharedValue<number>,
    sweepAnim: any,
  ) =>
    useAnimatedStyle(() => ({
      opacity: entryOp.value * sweepAnim.sweepOp.value,
      transform: [
        { translateX: sweepAnim.sweepX.value },
        { translateY: sweepAnim.sweepY.value },
        { rotate: `${sweepAnim.rot.value}deg` },
      ],
      position: "absolute",
    }));

  const styleW1 = sweepElementStyle(floatOpacity1, sweepW1);
  const styleW2 = sweepElementStyle(floatOpacity2, sweepW2);
  const styleB1 = floatElementStyle(floatOpacity3, floatB1, -20);
  const styleB2 = floatElementStyle(floatOpacity4, floatB2, 15);
  const styleL1 = floatElementStyle(floatOpacity5, floatL1, -10);
  const styleL2 = floatElementStyle(floatOpacity6, floatL2, 30);
  const styleL3 = floatElementStyle(floatOpacity7, floatL3, 45);

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value * subtitlePulseOpacity.value,
  }));

  if (!fontsLoaded) return null; // or a tiny spinner, but we want seamless

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FAFAF7" />
      {/* Container aligning everything in the center */}
      <View style={styles.contentWrapper}>
        {/* Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.title}>Building {userName}'s nest</Text>
        </Animated.View>

        {/* Nest Illusion Box (approx 300x300 for floating element placement relative to center) */}
        <View style={styles.nestIllustrationBox}>
          {/* Main Nest Component */}
          <Animated.View style={[styles.mainNestContainer, mainNestStyle]}>
            <NestImage width={194} height={94} />
          </Animated.View>

          {/* Floating Elements layer */}
          <Animated.View
            style={[
              styles.floatingElement,
              { top: "25%", left: "10%" },
              styleW1,
            ]}
          >
            <WindImage width={40} height={40} opacity={0.6} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { top: "15%", right: "15%" },
              styleW2,
            ]}
          >
            <WindImage width={40} height={40} opacity={0.5} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { top: "20%", left: "20%" },
              styleB1,
            ]}
          >
            <BranchImage width={32} height={32} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { bottom: "20%", right: "15%" },
              styleB2,
            ]}
          >
            <BranchImage width={32} height={32} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { top: "15%", right: "25%" },
              styleL1,
            ]}
          >
            <LeafImage width={28} height={28} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { bottom: "25%", left: "15%" },
              styleL2,
            ]}
          >
            <LeafImage width={28} height={28} />
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingElement,
              { top: "45%", right: "5%" },
              styleL3,
            ]}
          >
            <LeafImage width={28} height={28} />
          </Animated.View>
        </View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
          <Text style={styles.subtitle}>{statusText}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF7", // pure cream/off-white background
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  titleContainer: {
    marginBottom: 40, // spacing above the nest
  },
  title: {
    fontFamily: "InstrumentSans_600SemiBold",
    fontSize: 24, // Refined ~22-24px humanist serif title
    color: "#1a1a1a", // near-black
    textAlign: "center",
  },
  nestIllustrationBox: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Allows absolutely positioned floating decorations
    marginVertical: 10,
  },
  mainNestContainer: {
    zIndex: 10, // Keep nest strictly in center visually above most debris
  },
  floatingElement: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitleContainer: {
    marginTop: 30, // spacing below nest box
  },
  subtitle: {
    fontSize: 14, // ~13-14px subtitle
    color: "#8A8A8A", // muted gray
    textAlign: "center",
    fontWeight: "400",
  },
});

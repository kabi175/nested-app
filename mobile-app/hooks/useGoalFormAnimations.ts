import { useEffect, useState } from "react";
import { Animated } from "react-native";

export function useGoalFormAnimations() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [inputSectionAnimations, setInputSectionAnimations] = useState<{
    [key: string]: Animated.Value;
  }>({});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for future cost
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

  const animateInputSection = (goalId: string) => {
    const currentAnim = inputSectionAnimations[goalId] || new Animated.Value(1);

    Animated.sequence([
      Animated.timing(currentAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(currentAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setInputSectionAnimations((prev) => ({
      ...prev,
      [goalId]: currentAnim,
    }));

    return currentAnim;
  };

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    pulseAnim,
    inputSectionAnimations,
    animateInputSection,
  };
}


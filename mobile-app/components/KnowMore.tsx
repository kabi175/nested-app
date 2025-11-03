import { Layout, Text } from "@ui-kitten/components";
import {
  Clock,
  Heart,
  Shield,
  TrendingUp,
  UsersRound,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  cardBgColor: string;
}

const features: FeatureCard[] = [
  {
    title: "No new demat account",
    description: "Invest with your existing bank account.",
    icon: <Shield size={40} />,
    iconBgColor: "#E6F0FF",
    iconColor: "#6699FF",
    cardBgColor: "#FFFFFF",
  },
  {
    title: "Money goes directly to AMCs",
    description: "Your investment is always safe.",
    icon: <TrendingUp size={40} />,
    iconBgColor: "#E8F0FE",
    iconColor: "#4285F4",
    cardBgColor: "#FFFFFF",
  },
  {
    title: "No lock-in",
    description: "Withdraw your money anytime, no questions asked.",
    icon: <Clock size={40} />,
    iconBgColor: "#DBF2FF",
    iconColor: "#2563EB",
    cardBgColor: "#F0F8F8",
  },
  {
    title: "Flexible SIPs",
    description: "Start, stop or modify your SIPs anytime.",
    icon: <Heart size={40} />,
    iconBgColor: "#E6F0FF",
    iconColor: "#6699FF",
    cardBgColor: "#F8F8FC",
  },
  {
    title: "Goal-linked portfolio",
    description: "Investments aligned with your child's goals.",
    icon: <UsersRound size={40} />,
    iconBgColor: "#E6F0FF",
    iconColor: "#6699FF",
    cardBgColor: "#FFFFFF",
  },
];

const FLIP_DURATION = 3000; // 3 seconds per card
const FLIP_ANIMATION_DURATION = 600; // Animation duration

export default function KnowMore() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotateY = useSharedValue(0);

  const updateIndex = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  useEffect(() => {
    // Auto-flip every FLIP_DURATION
    const startAutoFlip = () => {
      // Initial delay before first flip
      const timeout = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          rotateY.value = withTiming(
            90,
            { duration: FLIP_ANIMATION_DURATION / 2 },
            (finished) => {
              if (finished) {
                runOnJS(updateIndex)();
                rotateY.value = -90;
                rotateY.value = withTiming(0, {
                  duration: FLIP_ANIMATION_DURATION / 2,
                });
              }
            }
          );
        }, FLIP_DURATION);
      }, FLIP_DURATION);

      return timeout;
    };

    const timeout = startAutoFlip();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = rotateY.value;
    return {
      transform: [{ rotateY: `${rotate}deg` }],
      opacity: Math.abs(rotate) >= 90 ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = rotateY.value;
    return {
      transform: [{ rotateY: `${rotate + 180}deg` }],
      opacity: Math.abs(rotate) >= 90 ? 1 : 0,
    };
  }, []);

  const currentFeature = features[currentIndex];
  const nextFeature = features[(currentIndex + 1) % features.length];

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header */}
      <Layout style={[styles.header, { backgroundColor: "transparent" }]}>
        <Text category="h4" style={styles.title}>
          Know More, Invest Better
        </Text>
      </Layout>

      {/* Flip Card Container */}
      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          {/* Front Card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { backgroundColor: currentFeature.cardBgColor },
              frontAnimatedStyle,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentFeature.iconBgColor },
              ]}
            >
              {React.cloneElement(
                currentFeature.icon as React.ReactElement<any>,
                {
                  color: currentFeature.iconColor,
                }
              )}
            </View>
            <Text category="h5" style={styles.cardTitle}>
              {currentFeature.title}
            </Text>
            <Text category="p1" style={styles.cardDescription}>
              {currentFeature.description}
            </Text>
          </Animated.View>

          {/* Back Card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { backgroundColor: nextFeature.cardBgColor },
              backAnimatedStyle,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: nextFeature.iconBgColor },
              ]}
            >
              {React.cloneElement(nextFeature.icon as React.ReactElement<any>, {
                color: nextFeature.iconColor,
              })}
            </View>
            <Text category="h5" style={styles.cardTitle}>
              {nextFeature.title}
            </Text>
            <Text category="p1" style={styles.cardDescription}>
              {nextFeature.description}
            </Text>
          </Animated.View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 32,
    paddingVertical: 8,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {
    // Front card styles
  },
  cardBack: {
    // Back card initial transform handled by animated style
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
});

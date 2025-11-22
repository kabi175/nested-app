import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, Target, TrendingUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const SUPPORTIVE_MESSAGES = [
  "Analyzing market trends...",
  "Optimizing investments for higher returns...",
  "Finalizing your personalized plan...",
];

export default function LoadingScreen() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [dotAnimations] = useState([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation for main circle
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    // Pulse animation for center icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animate dots in sequence
    const animateDots = () => {
      const animations = dotAnimations.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.loop(
        Animated.sequence([Animated.parallel(animations), Animated.delay(1000)])
      ).start();
    };

    animateDots();

    // Rotate supportive messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % SUPPORTIVE_MESSAGES.length);
    }, 3000);

    // Simulate loading completion after 5 seconds
    const loadingTimeout = setTimeout(() => {
      router.replace("/payment");
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(loadingTimeout);
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const rotationInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const outerRingRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F0FDF4", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Loading Animation */}
          <View style={styles.loadingContainer}>
            {/* Outer static icons */}
            <View style={styles.staticIcons}>
              <View style={[styles.staticIcon, styles.targetIcon]}>
                <Target size={20} color="#3B82F6" />
              </View>
              <View style={[styles.staticIcon, styles.clockIcon]}>
                <Clock size={20} color="#8B5CF6" />
              </View>
            </View>

            {/* Main loading circle */}
            <View style={styles.mainCircle}>
              {/* Outer rotating ring */}
              <Animated.View
                style={[
                  styles.outerRing,
                  {
                    transform: [{ rotate: outerRingRotation }],
                  },
                ]}
              />

              {/* Inner rotating ring */}
              <Animated.View
                style={[
                  styles.innerRing,
                  {
                    transform: [{ rotate: rotationInterpolate }],
                  },
                ]}
              />

              {/* Center icon */}
              <Animated.View
                style={[
                  styles.centerIcon,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <TrendingUp size={32} color="#10B981" />
              </Animated.View>

              {/* Orbiting dots */}
              <View style={styles.orbitingDots}>
                {[0, 1, 2, 3].map((index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.orbitingDot,
                      {
                        transform: [
                          {
                            rotate: rotationInterpolate,
                          },
                          {
                            translateY: -60,
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === 0
                              ? "#3B82F6"
                              : index === 1
                              ? "#8B5CF6"
                              : index === 2
                              ? "#10B981"
                              : "#06B6D4",
                        },
                      ]}
                    />
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>

          {/* Main Message */}
          <View style={styles.textContainer}>
            <ThemedText style={styles.mainMessage}>
              Creating your customized portfolio
            </ThemedText>
            <ThemedText style={styles.mainMessage}>for your goal...</ThemedText>
          </View>

          {/* Supportive Message */}
          <Animated.View style={styles.supportiveContainer}>
            <ThemedText style={styles.supportiveMessage}>
              {SUPPORTIVE_MESSAGES[currentMessageIndex]}
            </ThemedText>
          </Animated.View>

          {/* Progress Dots */}
          <View style={styles.progressDots}>
            <View style={styles.dotRow}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      opacity: dotAnimations[index],
                      backgroundColor: index === 1 ? "#10B981" : "#E5E7EB",
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.dotRow}>
              {[3, 4, 5].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      opacity: dotAnimations[index],
                      backgroundColor: "#E5E7EB",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Tagline */}
          <ThemedText style={styles.tagline}>
            This will only take a few seconds.
          </ThemedText>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  staticIcons: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  staticIcon: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  targetIcon: {
    top: 0,
    left: 20,
  },
  clockIcon: {
    top: 0,
    right: 20,
  },
  mainCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#E0F2FE",
    borderTopColor: "#06B6D4",
  },
  innerRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ECFDF5",
    borderTopColor: "#10B981",
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  orbitingDots: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  orbitingDot: {
    position: "absolute",
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  mainMessage: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 32,
  },
  supportiveContainer: {
    marginBottom: 40,
    minHeight: 24,
  },
  supportiveMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#10B981",
    textAlign: "center",
  },
  progressDots: {
    marginBottom: 40,
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },
});

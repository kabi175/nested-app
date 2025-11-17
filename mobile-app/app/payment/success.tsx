import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
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
  }, []);

  const handleContinue = () => {
    router.replace("/(tabs)/child");
  };

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
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
          </View>

          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>
              Portfolio Created Successfully!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Your customized investment plan is ready. Start your journey
              towards your child&apos;s future goals.
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>View My Goals</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
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
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

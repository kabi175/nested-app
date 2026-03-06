import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoDefault from "../../assets/images/v2/logo-default.svg";

interface SplashScreenComponentProps {
  onFinish?: () => void;
}

export default function SplashScreenComponent({
  onFinish,
}: SplashScreenComponentProps) {

  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the logo in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) {
        // Hold, then fade out the whole screen
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => onFinish());
        }, 800);
      }
    });
  }, []);

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.container, { opacity }]}>
        {/* Gradient fills the ENTIRE screen, including behind status bar & nav bar */}
        <LinearGradient
          colors={["#1F34E0", "#2F4BFF", "#6A7FEF", "#2F4BFF", "#1F34E0"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* SafeAreaView centres the logo within the usable screen area */}
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.logoWrap,
              { transform: [{ scale: logoScale }], opacity: logoOpacity },
            ]}
          >
            <LogoDefault width={109} height={109} />
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  // Covers the whole screen, sits on top of everything
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  // SafeAreaView that fills the container and centres its child
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    // No manual margins — pure flexbox centres this
    alignItems: "center",
    justifyContent: "center",
  },
});

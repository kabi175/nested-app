import { logKycCompletion } from "@/services/metaEvents";
import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function KycSuccessScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    logKycCompletion();
  }, []);

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

  const handleGoToGoals = () => {
    router.replace("/(tabs)/child");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout level="1" style={styles.container}>
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
            <Text category="h3" style={styles.title}>
              KYC Verification Complete!
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Your KYC has been successfully verified. You can now start
              creating investment goals for your child's future.
            </Text>
          </View>

          <Button
            size="large"
            style={styles.button}
            onPress={handleGoToGoals}
          >
            Go to Goals
          </Button>
        </Animated.View>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    width: "100%",
    marginTop: 16,
  },
});


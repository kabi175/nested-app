import { Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

interface FormHeaderProps {
  title: string;
  subtitle: string;
  animationStyle?: any;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  animationStyle,
}) => {
  return (
    <Animated.View style={[styles.headerContainer, animationStyle]}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.iconContainer}>
          <Sparkles size={32} color="#fff" />
        </View>
        <Text category="h3" style={styles.headerTitle}>
          {title}
        </Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  gradientHeader: {
    padding: 24,
    borderRadius: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
  },
});

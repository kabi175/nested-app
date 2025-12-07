import { Card, Text } from "@ui-kitten/components";
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
      <Card style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Sparkles size={32} color="#fff" />
        </View>
        <Text category="h3" style={styles.headerTitle}>
          {title}
        </Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardHeader: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: "#3366FF",
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

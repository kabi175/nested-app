import { BasketCardData } from "@/hooks/useSuperFDBaskets";
import { formatCurrency } from "@/utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Target, TrendingUp, Zap } from "lucide-react-native";
import React, { useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";


interface BasketCardProps {
  data: BasketCardData;
  cardWidth?: number;
}

export default function BasketCard({
  data,
  cardWidth,
}: BasketCardProps) {
  const { width } = useWindowDimensions();
  const calculatedCardWidth = cardWidth ?? width - 80; // Account for margins and padding
  const cardScale = React.useRef(new Animated.Value(1)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  const [isLoading, setIsLoading] = useState(false);

  const handleButtonPress = () => {
    if(isLoading) return;
    setIsLoading(true);
    try {
    if(data.goalId) {
      router.push(`/goal/${data.goalId}/holdings`);
    } else {
      router.push(`/basket?type=${data.id}`);
    }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable onPress={handleButtonPress} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: data.cardBgColor,
            width: calculatedCardWidth,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        {/* Recommended Badge */}
        {data.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedStar}>★</Text>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: data.iconBgColor },
            ]}
          >
            {data.icon}
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={[styles.subtitle, { color: data.subtitleColor }]}>
              {data.subtitle}
            </Text>
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.metricsSection}>
          <View style={styles.metricBox}>
            <TrendingUp size={18} color="#10B981" />
            <Text style={styles.metricLabel}>RETURNS</Text>
            <Text style={styles.metricValue}>{data.returns}</Text>
          </View>
          <View style={styles.metricBox}>
            <Target size={18} color="#3B82F6" />
            <Text style={styles.metricLabel}>RISK</Text>
            <Text style={styles.metricValue}>{data.risk}</Text>
          </View>
          <View style={styles.metricBox}>
            <Zap size={18} color="#F97316" />
            <Text style={styles.metricLabel}>LOCK-IN</Text>
            <Text style={styles.metricValue}>{data.lockIn}</Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          {data.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Minimum Investment */}
        <View
          style={[
            styles.minInvestmentContainer,
            { backgroundColor: data.minInvestmentBgColor },
          ]}
        >
          <Text style={styles.minInvestmentLabel}>{data.currentValue ? "Current Value" : "Min. Investment"}</Text>
          <Text
            style={[
              styles.minInvestmentValue,
              { color: data.minInvestmentTextColor },
            ]}
          >
            {data.currentValue ? formatCurrency(data.currentValue) : data.minInvestment}
          </Text>
        </View>

        {/* Invest Now Button */}
        <Pressable
          onPress={() => handleButtonPress()}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Animated.View
            style={[
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <LinearGradient
              colors={data.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{
              isLoading ? "Loading..." : (
                data.currentValue ? "View Details" : "Invest Now"
              )}</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendedBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9333EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  recommendedStar: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 4,
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  metricsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  featuresSection: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6B7280",
    marginTop: 7,
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  minInvestmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  minInvestmentLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  minInvestmentValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  learnMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  learnMoreText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
});

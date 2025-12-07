import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface WealthBasket {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  exploreColor: string;
  cardBgColor: string;
  borderColor: string;
}

interface PopularWealthBasketsProps {
  onExplore?: (basketId: string) => void;
}

const wealthBaskets: WealthBasket[] = [
  {
    id: "better-than-fd",
    title: "Better than FD",
    description:
      "Monthly income of upto ₹ 775 per ₹ 1 lakh invested with no lock-in",
    icon: "shield-checkmark",
    iconBgColor: "#FCE7F3",
    iconColor: "#DC2626",
    exploreColor: "#DC2626",
    cardBgColor: "#FCE7F3",
    borderColor: "#DC2626",
  },
  {
    id: "all-weather",
    title: "All Weather",
    description: "Upto 13% historical return with moderate risk",
    icon: "umbrella",
    iconBgColor: "#FEF3C7",
    iconColor: "#D97706",
    exploreColor: "#D97706",
    cardBgColor: "#FEF3C7",
    borderColor: "#D97706",
  },
  {
    id: "choti-sip",
    title: "Choti SIP",
    description: "Upto 8% historical return with low risk, no lock-in",
    icon: "cash-outline",
    iconBgColor: "#D1FAE5",
    iconColor: "#059669",
    exploreColor: "#059669",
    cardBgColor: "#D1FAE5",
    borderColor: "#059669",
  },
];

export default function PopularWealthBaskets({
  onExplore,
}: PopularWealthBasketsProps) {
  const handleExplore = (basketId: string) => {
    router.push(`/basket?type=${basketId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>
            Most Popular Wealth Baskets
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Curated by experts, made easy to invest
          </ThemedText>
        </View>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {wealthBaskets.map((basket) => (
          <TouchableOpacity
            key={basket.id}
            onPress={() => handleExplore(basket.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: basket.cardBgColor,
                  borderColor: basket.borderColor,
                },
              ]}
            >
              <View style={styles.cardContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: basket.iconBgColor },
                  ]}
                >
                  <Ionicons
                    name={basket.icon}
                    size={24}
                    color={basket.iconColor}
                  />
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <ThemedText style={styles.cardTitle}>
                    {basket.title}
                  </ThemedText>
                  <ThemedText style={styles.cardDescription}>
                    {basket.description}
                  </ThemedText>
                </View>

                {/* Explore Button */}
                <Pressable
                  onPress={() => handleExplore(basket.id)}
                  style={styles.exploreButton}
                >
                  <ThemedText
                    style={[styles.exploreText, { color: basket.exploreColor }]}
                  >
                    Explore →
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    paddingBottom: 24,
  },
  headerSection: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 180,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  exploreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

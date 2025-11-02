import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface InvestmentLandingScreenProps {
  onExploreStrategy?: (strategy: string) => void;
  onLearnMore?: () => void;
}

interface InvestmentStrategy {
  id: string;
  title: string;
  description: string;
  borderColor: string;
  tagColor: string;
  tags: string[];
}

const investmentStrategies: InvestmentStrategy[] = [
  {
    id: "growth",
    title: "Growth Focussed",
    description: "Long-term growth",
    borderColor: "#D8B4FE",
    tagColor: "#F3E8FF",
    tags: ["Equity", "High Risk", "5+ years"],
  },
  {
    id: "all-weather",
    title: "All Weather",
    description: "Steady growth",
    borderColor: "#FDE047",
    tagColor: "#FEFCE8",
    tags: ["Mixed", "Moderate", "3+ years"],
  },
  {
    id: "better-than-fd",
    title: "Better Than FD",
    description: "Safe returns",
    borderColor: "#86EFAC",
    tagColor: "#F0FDF4",
    tags: ["Debt", "Low Risk", "1+ month"],
  },
];

export default function InvestmentLandingScreen({
  onExploreStrategy,
  onLearnMore,
}: InvestmentLandingScreenProps) {
  const handleExploreStrategy = (strategyId: string) => {
    onExploreStrategy?.(strategyId);
    console.log("Explore strategy:", strategyId);
  };

  const handleLearnMore = () => {
    onLearnMore?.();
    console.log("Learn more pressed");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <ThemedText style={styles.headerTitle}>
          No Definite Goal – Begin Here
        </ThemedText>

        {/* Investment Strategy Cards */}
        <View style={styles.strategiesContainer}>
          {investmentStrategies.map((strategy) => (
            <TouchableOpacity
              key={strategy.id}
              style={[
                styles.strategyCard,
                { borderColor: strategy.borderColor },
              ]}
              onPress={() => handleExploreStrategy(strategy.id)}
              activeOpacity={0.8}
            >
              {/* Card Content */}
              <View style={styles.cardContent}>
                <ThemedText style={styles.strategyTitle}>
                  {strategy.title}
                </ThemedText>
                <ThemedText style={styles.strategyDescription}>
                  {strategy.description}
                </ThemedText>

                {/* Tags */}
                <View style={styles.tagsContainer}>
                  {strategy.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        { backgroundColor: strategy.tagColor },
                      ]}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Explore Link */}
                <TouchableOpacity
                  style={styles.exploreLink}
                  onPress={() => handleExploreStrategy(strategy.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.exploreLinkText}>Explore →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#374151",
  },
  strategiesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 12,
  },
  strategyCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 200,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  strategyDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  exploreLink: {
    alignSelf: "flex-start",
  },
  exploreLinkText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  knowMoreSection: {
    marginBottom: 20,
  },
  knowMoreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#374151",
  },
  noLockInCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noLockInContent: {
    alignItems: "center",
  },
  clockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noLockInTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  noLockInDescription: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
  },
});

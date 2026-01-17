import { Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { Award, Check, Shield, TrendingUp } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface TrustCard {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  color: string;
}

const trustCards: TrustCard[] = [
  {
    icon: Award,
    title: "Expert-led curation",
    description:
      "Our team of experts carefully selects and vets every investment option.",
    color: "from-green-50 to-green-100",
  },
  {
    icon: TrendingUp,
    title: "Tailored for education goals",
    description: "Plans designed to meet the rising costs of education.",
    color: "from-blue-50 to-blue-100",
  },
  {
    icon: Shield,
    title: "Disciplined yet flexible",
    description:
      "Our approach adapts to market changes while keeping your goals in sight.",
    color: "from-amber-50 to-amber-100",
  },
  {
    icon: Check,
    title: "Regulated & transparent",
    description:
      "Fully compliant with regulations, providing you peace of mind.",
    color: "from-indigo-50 to-indigo-100",
  },
];

// Map Tailwind color classes to actual hex colors
const getGradientColors = (colorClass: string): [string, string] => {
  const colorMap: Record<string, [string, string]> = {
    "from-green-50 to-green-100": ["#f0fdf4", "#dcfce7"],
    "from-blue-50 to-blue-100": ["#eff6ff", "#dbeafe"],
    "from-amber-50 to-amber-100": ["#fffbeb", "#fef3c7"],
    "from-indigo-50 to-indigo-100": ["#eef2ff", "#e0e7ff"],
  };
  return colorMap[colorClass] || ["#ffffff", "#f3f4f6"];
};

const CARD_WIDTH = 280;
const CARD_GAP = 16;
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_GAP;
const CONTAINER_PADDING = 20;
const SCROLL_INTERVAL = 3000; // 3 seconds per card

export default function WhyParentTrustUs() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAutoScrolling) return;

    scrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % trustCards.length;
        scrollViewRef.current?.scrollTo({
          x: CONTAINER_PADDING + nextIndex * CARD_TOTAL_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, SCROLL_INTERVAL);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling]);

  const handleScrollBeginDrag = () => {
    setIsAutoScrolling(false);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
  };

  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 5 seconds of user interaction ending
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round((offsetX - CONTAINER_PADDING) / CARD_TOTAL_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, trustCards.length - 1)));
  };

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header Title */}
      <Text category="h4" style={styles.headerTitle}>
        Why Parents Trust Us
      </Text>

      {/* Cards Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
        style={styles.scrollView}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_TOTAL_WIDTH}
        snapToAlignment="start"
      >
        {trustCards.map((card, index) => {
          const IconComponent = card.icon;
          const gradientColors = getGradientColors(card.color);

          return (
            <LinearGradient
              key={index}
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.card}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <IconComponent size={32} color="#3B82F6" />
              </View>

              {/* Title */}
              <Text category="h6" style={styles.cardTitle}>
                {card.title}
              </Text>

              {/* Description */}
              <Text category="p1" style={styles.cardDescription}>
                {card.description}
              </Text>
            </LinearGradient>
          );
        })}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  scrollView: {
    flexGrow: 0,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 16,
  },
  card: {
    width: 280,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    textAlign: "center",
  },
});

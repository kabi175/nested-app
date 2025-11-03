import { Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const testimonials = [
  {
    name: "Ananya R.",
    text: "Nested made planning for my daughter's college so simple and clear.",
    rating: 5,
  },
  {
    name: "Rohit S.",
    text: "Finally, an investment platform that understands a parent's needs.",
    rating: 5,
  },
  {
    name: "Priya M.",
    text: "The goal-based approach is a game-changer. I feel much more confident about my child's future.",
    rating: 5,
  },
  {
    name: "Arjun K.",
    text: "I love how transparent and flexible the SIPs are. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sneha P.",
    text: "The cost explainer tool was an eye-opener. It helped us set realistic goals.",
    rating: 5,
  },
  {
    name: "Vikram T.",
    text: "Super easy to use, even for someone who isn't a finance pro.",
    rating: 5,
  },
  {
    name: "Anita R.",
    text: "The transparency of investments and expenses is very good.",
    rating: 4.5,
  },
  {
    name: "Rohit S.",
    text: "I finally feel confident that my son's education is financially secure.",
    rating: 5,
  },
  {
    name: "Meera K.",
    text: "The clarity and guidance I received were unmatched.",
    rating: 4,
  },
  {
    name: "Vikas M.",
    text: "I love how the app connects every rupee I invest to my child's goals.",
    rating: 4.5,
  },
  {
    name: "Priya D.",
    text: "Planning for higher education abroad no longer feels impossible.",
    rating: 5,
  },
  {
    name: "Arjun T.",
    text: "This is the first time I feel in control of my child's financial future.",
    rating: 4,
  },
  {
    name: "Kavita P.",
    text: "Nested gave me peace of mind without the jargon.",
    rating: 4.5,
  },
  {
    name: "Sanjay B.",
    text: "Their portfolios are built exactly for parents like me.",
    rating: 5,
  },
  {
    name: "Nisha V.",
    text: "I'm glad I started early. Now I know I'll be ready when my daughter is.",
    rating: 4,
  },
  {
    name: "Amit J.",
    text: "The design is simple, but the impact is huge.",
    rating: 4.5,
  },
  {
    name: "Shalini G.",
    text: "Every parent should have this app! It makes goal planning effortless.",
    rating: 5,
  },
  {
    name: "Dev R.",
    text: "Nested gave me confidence that my investments are on the right track.",
    rating: 4,
  },
  {
    name: "Sunita N.",
    text: "This feels like a true partner in securing my child's dreams.",
    rating: 4.5,
  },
  {
    name: "Karan H.",
    text: "No distractions, no confusion - just clear planning.",
    rating: 5,
  },
  {
    name: "Pooja L.",
    text: "I can finally sleep peacefully knowing my child's education is secure.",
    rating: 4,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Calculate card width: full width minus padding, but cap at 400px max
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 80, 400);
const CARD_GAP = 4;
const AUTO_ROTATE_INTERVAL = 4000; // 4 seconds

interface TestimonialCardProps {
  testimonial: (typeof testimonials)[0];
  index: number;
  isVisible: boolean;
}

function TestimonialCard({
  testimonial,
  index,
  isVisible,
}: TestimonialCardProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(30);

  useEffect(() => {
    if (isVisible) {
      // Reset and animate in
      opacity.value = 0;
      scale.value = 0.9;
      translateY.value = 30;

      opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
      scale.value = withDelay(
        index * 100,
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      translateY.value = withDelay(
        index * 100,
        withSpring(0, { damping: 10, stiffness: 100 })
      );
    } else {
      // Animate out
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.9, { duration: 300 });
      translateY.value = withTiming(30, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(testimonial.rating);
    const hasHalfStar = testimonial.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={18} color="#FFD700" fill="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <View key="half" style={styles.halfStarContainer}>
          <Star size={18} color="#FFD700" fill="#FFD700" />
          <View style={styles.halfStarMask} />
        </View>
      );
    }

    const remainingStars = 5 - Math.ceil(testimonial.rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={18} color="#E5E5E5" fill="none" />
      );
    }

    return stars;
  };

  return (
    <Animated.View style={[styles.testimonialCard, animatedStyle]}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      <Text style={styles.quoteText}>&ldquo;{testimonial.text}&rdquo;</Text>
      <Text style={styles.authorText}>— {testimonial.name}</Text>
    </Animated.View>
  );
}

export default function WhatParentsSay() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get 3 testimonials to show at a time
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push({
        testimonial: testimonials[index],
        originalIndex: index,
      });
    }
    return visible;
  };

  useEffect(() => {
    // Animate button fade in and slide up
    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(
      400,
      withSpring(0, {
        damping: 12,
        stiffness: 100,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-rotate testimonials
    const rotate = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 3) % testimonials.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    };

    autoRotateTimeoutRef.current = setInterval(rotate, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoRotateTimeoutRef.current) {
        clearInterval(autoRotateTimeoutRef.current);
      }
    };
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { translateY: buttonTranslateY.value },
      { scale: buttonScale.value },
    ],
  }));

  const handleButtonPress = () => {
    // Press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // Navigate to goal creation
    router.push("/(tabs)/child/create");
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header Title */}
      <Text category="h3" style={styles.headerTitle}>
        What Parents Say
      </Text>

      {/* Testimonials Container */}
      <View style={styles.testimonialsContainer}>
        {visibleTestimonials.map((item, index) => (
          <TestimonialCard
            key={`${item.originalIndex}-${currentIndex}`}
            testimonial={item.testimonial}
            index={index}
            isVisible={!isTransitioning}
          />
        ))}
      </View>

      {/* Let's Begin Button */}
      <Animated.View style={buttonAnimatedStyle}>
        <Pressable
          onPress={handleButtonPress}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={["#4A90E2", "#6A9EEB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Let&apos;s Begin</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 32,
    textAlign: "center",
  },
  testimonialsContainer: {
    flexDirection: "column",
    gap: CARD_GAP,
    marginBottom: 32,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: CARD_WIDTH,
    minHeight: 180,
    maxWidth: 400,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  halfStarContainer: {
    position: "relative",
    overflow: "hidden",
  },
  halfStarMask: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#FFFFFF",
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333333",
    lineHeight: 24,
    marginBottom: 16,
  },
  authorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  button: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 9999,
    overflow: "hidden",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});

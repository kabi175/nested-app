import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PathCardProps {
  /** Card title, e.g. "Top colleges India" */
  title: string;
  /** SVG illustration element */
  icon: React.ReactElement;
  /** Whether this card is currently selected */
  selected: boolean;
  /** Called when the card is pressed */
  onPress: () => void;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bgUnselected: "#F4F4F4",
  textUnselected: "#2E2E2E",
  shapeUnselected: "#D8DDFA",

  gradientStart: "#3E63F0",
  gradientEnd: "#3A56D6",
  textSelected: "#FFFFFF",
  shapeSelected: "rgba(255,255,255,0.18)",

  cardRadius: 16,
  cardPadding: 14,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PathCard({
  title,
  icon,
  selected,
  onPress,
}: PathCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, {
      damping: 14,
      stiffness: 120,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.05]);
    return {
      transform: [{ scale }],
    };
  });

  const cardContent = (
    <>
      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: selected ? C.textSelected : C.textUnselected },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        {/* Decorative rounded semi-circle */}
        <View
          style={[
            styles.decorativeShape,
            {
              backgroundColor: selected
                ? C.shapeSelected
                : C.shapeUnselected,
            },
          ]}
        />
        {/* SVG illustration */}
        <View style={styles.iconContainer}>{icon}</View>
      </View>
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.cardOuter, animatedContainerStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
    >
      {selected ? (
        <LinearGradient
          colors={[C.gradientStart, C.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardInner}
        >
          {cardContent}
        </LinearGradient>
      ) : (
        <View style={[styles.cardInner, { backgroundColor: C.bgUnselected }]}>
          {cardContent}
        </View>
      )}
    </AnimatedPressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardOuter: {
    flex: 1,
    borderRadius: C.cardRadius,
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInner: {
    borderRadius: C.cardRadius,
    padding: C.cardPadding,
    overflow: "hidden",
    minHeight: 150,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  illustrationArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    minHeight: 100,
  },
  decorativeShape: {
    position: "absolute",
    bottom: -20,
    width: "100%",
    height: 100,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  iconContainer: {
    zIndex: 1,
  },
});

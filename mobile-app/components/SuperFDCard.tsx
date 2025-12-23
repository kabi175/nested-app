import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

interface SuperFDCardProps {
  onPress?: () => void;
  onInvestNowPress?: () => void;
}

export default function SuperFDCard({
  onPress,
  onInvestNowPress,
}: SuperFDCardProps) {
  const { width } = useWindowDimensions();
  const cardScale = React.useRef(new Animated.Value(1)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;

  const handleCardPress = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onInvestNowPress?.();
  };

  // Generate pattern dots for background texture - extremely subtle with fade
  const PatternOverlay = () => {
    const dots = [];
    const rows = 10;
    const spacing = 45;
    const cols = Math.floor((width - 40) / spacing);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        // Fade toward bottom-right and reduce near CTA button area
        const distanceFromTop = y / (rows * spacing);
        const distanceFromLeft = x / (cols * spacing);
        const fadeFactor = Math.max(
          0,
          1 - (distanceFromTop * 0.6 + distanceFromLeft * 0.3)
        );
        const opacity = Math.min(0.04, 0.04 * fadeFactor);

        dots.push(
          <Circle
            key={`${row}-${col}`}
            cx={x}
            cy={y}
            r={2.5}
            fill={`rgba(255, 255, 255, ${opacity})`}
          />
        );
      }
    }

    return (
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        pointerEvents="none"
      >
        <Defs>
          <SvgLinearGradient
            id="patternFade"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="rgba(255,255,255,0.04)"
              stopOpacity="1"
            />
            <Stop
              offset="100%"
              stopColor="rgba(255,255,255,0)"
              stopOpacity="0"
            />
          </SvgLinearGradient>
        </Defs>
        {dots}
      </Svg>
    );
  };

  // Very faint light reflection overlay - non-symmetric, pushed right
  const LightReflectionOverlay = () => {
    return (
      <LinearGradient
        colors={[
          "transparent",
          "transparent",
          "rgba(255, 255, 255, 0.06)",
          "rgba(255, 255, 255, 0.06)",
          "transparent",
        ]}
        start={{ x: 0.7, y: 0.3 }}
        end={{ x: 1.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    );
  };

  return (
    <Pressable onPress={handleCardPress} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <LinearGradient
          colors={["#7C3AED", "#8B5CF6", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Background Pattern */}
          <PatternOverlay />

          {/* Edge darkening overlay */}
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0.15)",
              "rgba(0, 0, 0, 0.05)",
              "transparent",
              "rgba(0, 0, 0, 0.05)",
              "rgba(0, 0, 0, 0.15)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Center-left brightening */}
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.08)", "transparent", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Very faint light reflection */}
          <LightReflectionOverlay />

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Left Section */}
            <View style={styles.leftSection}>
              {/* Title */}
              <Text style={styles.title}>
                Invest in Super FD<Text style={styles.trademark}>™</Text>
              </Text>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  Don&apos;t be satisfied with Bank FD,
                </Text>
                <Text style={styles.description}>Choose Super FD</Text>
              </View>

              {/* Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Up to <Text style={styles.badgeHighlight}>11%</Text> p.a.
                </Text>
              </View>

              {/* CTA Button */}
              <Pressable
                onPress={handleButtonPress}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Invest Now"
              >
                <Animated.View
                  style={[
                    styles.buttonContent,
                    {
                      transform: [{ scale: buttonScale }],
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>Invest Now</Text>
                  <View style={styles.buttonIconContainer}>
                    <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </Animated.View>
              </Pressable>
            </View>

            {/* Right Section - Circular Orb */}
            <View style={styles.rightSection}>
              <View style={styles.orbGlow}>
                <Svg width={70} height={70} style={styles.orbSvg}>
                  <Defs>
                    <RadialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#E9D5FF" stopOpacity="1" />
                      <Stop offset="40%" stopColor="#C4B5FD" stopOpacity="1" />
                      <Stop offset="70%" stopColor="#A78BFA" stopOpacity="1" />
                      <Stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
                    </RadialGradient>
                  </Defs>
                  <Circle cx="35" cy="35" r="35" fill="url(#orbGradient)" />
                </Svg>
                <View style={styles.orbContent}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  card: {
    borderRadius: 19,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  gradient: {
    minHeight: 200,
    position: "relative",
  },
  contentContainer: {
    flexDirection: "row",
    padding: 19,
    minHeight: 200,
  },
  leftSection: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 36,
  },
  trademark: {
    fontSize: 22,
    fontWeight: "bold",
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 2,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(167, 139, 250, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  badgeHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  button: {
    alignSelf: "flex-start",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4C1D95",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIconContainer: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 16,
  },
  orbGlow: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: "#A78BFA",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
    position: "relative",
    overflow: "visible",
  },
  orbSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  orbContent: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
  },
  rupeeSymbol: {
    fontSize: 36,
    color: "#4C1D95",
    fontWeight: "bold",
    textAlign: "center",
    includeFontPadding: false,
  },
});

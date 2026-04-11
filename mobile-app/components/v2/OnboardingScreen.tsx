import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoVarient from "../../assets/images/v2/logo-varient.svg";
import OnboardingCard from "./OnboardingCard";
import ProgressBar from "./ProgressBar";


// ─── Types ────────────────────────────────────────────────────────────────────

interface TitleSegment {
  text: string;
  highlighted?: boolean;
}

interface OnboardingSlide {
  id: string;
  titleSegments: TitleSegment[];
  description: string;
  renderIllustration: () => React.ReactNode;
}

// ─── Per-slide illustration compositions ─────────────────────────────────────
// Each is a self-contained layout using natural flow — no percentage-based
// absolute positioning that breaks inside flex containers.

/**
 * Slide 1: user-supplied pre-composited asset (egg-basket-sparkle.png)
 */
function Slide1Illustration() {
  return (
    <Image
      source={require("../../assets/images/v2/onboarding/egg-basket-sparkle.png")}
      style={illStyles.fullFrame}
      resizeMode="contain"
    />
  );
}

/**
 * Slide 2: branch crosses behind the nest; egg sits in the nest;
 * two leaves fall below.
 *
 * Layering order (bottom → top):
 *   branch → nest → egg → leaves
 *
 * We use a single absolutely-positioned container whose size is fixed
 * (not percentage) so children's absolute positions are reliable.
 */
function Slide2Illustration() {
  // branch.png already contains the hanging green leaf — no separate leaf needed.
  // branch rail sits at ~35% from top of the image; at h=100 that's y≈35 within the image.
  // We place the branch so its rail aligns with the nest bottom.
  const branchTop = 108; // image top; rail at branchTop+35 = 143
  const nestH = 82;
  const nestTop = branchTop + 35 - nestH; // nest bottom lands on rail → 61
  const eggH = 65;
  const eggTop = nestTop - 22; // egg sticks 22px above nest rim, lower half sits in the cup

  return (
    <View style={{ width: 240, height: 250 }}>
      {/* Nest — behind egg but in front of branch */}
      <Image
        source={require("../../assets/images/v2/onboarding/nest.png")}
        style={[illStyles.abs, { width: 182, height: nestH, top: nestTop, left: 29 }]}
        resizeMode="contain"
      />
      {/* Egg — sits inside the nest cup */}
      <Image
        source={require("../../assets/images/v2/onboarding/egg.png")}
        style={[illStyles.abs, { width: 52, height: eggH, top: eggTop, left: 94 }]}
        resizeMode="contain"
      />
      {/* Branch (includes the built-in hanging green leaf) — on top so it overlaps nest base */}
      <Image
        source={require("../../assets/images/v2/onboarding/branch.png")}
        style={[illStyles.abs, { width: 240, height: 100, top: branchTop, left: 0 }]}
        resizeMode="contain"
      />
      {/* Scattered twig decorations */}
      <Image
        source={require("../../assets/images/v2/onboarding/leaves.png")}
        style={[illStyles.abs, { width: 14, height: 14, top: 210, left: 52, transform: [{ rotate: "80deg" }] }]}
        resizeMode="contain"
      />
      <Image
        source={require("../../assets/images/v2/onboarding/leaves.png")}
        style={[illStyles.abs, { width: 12, height: 12, top: 228, left: 110, transform: [{ rotate: "130deg" }] }]}
        resizeMode="contain"
      />
      <Image
        source={require("../../assets/images/v2/onboarding/leaves.png")}
        style={[illStyles.abs, { width: 14, height: 14, top: 208, right: 42, transform: [{ rotate: "30deg" }] }]}
        resizeMode="contain"
      />
      <Image
        source={require("../../assets/images/v2/onboarding/leaves.png")}
        style={[illStyles.abs, { width: 11, height: 11, top: 232, right: 62, transform: [{ rotate: "160deg" }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Slide 3: storm cloud top-right, egg in the nest.
 */
function Slide3Illustration() {
  return (
    <View style={{ width: 240, height: 260 }}>
      {/* Storm cloud — top right, doesn't overlap nest */}
      <Image
        source={require("../../assets/images/v2/onboarding/storm.png")}
        style={[illStyles.abs, { width: 130, height: 130, top: 0, right: 0 }]}
        resizeMode="contain"
      />
      {/* Nest — lower centre */}
      <Image
        source={require("../../assets/images/v2/onboarding/nest.png")}
        style={[illStyles.abs, { width: 180, height: 100, top: 130, left: 30 }]}
        resizeMode="contain"
      />
      {/* Egg — peeks out of the nest cup */}
      <Image
        source={require("../../assets/images/v2/onboarding/egg.png")}
        style={[illStyles.abs, { width: 52, height: 60, top: 90, left: 94 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const illStyles = StyleSheet.create({
  fullFrame: {
    width: "100%",
    height: "100%",
  },
  abs: {
    position: "absolute",
  },
});

// ─── Slide data ───────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES: OnboardingSlide[] = [
  {
    id: "slide-1",
    titleSegments: [
      { text: "A smart education fund\nthat " },
      { text: " grows ", highlighted: true },
      { text: " with your child" },
    ],
    description:
      "We analyze 2000+ funds to select the right mix for you. Your nest aka portfolio is tailored using the best market data and risk insights.",
    renderIllustration: () => <Slide1Illustration />,
  },
  {
    id: "slide-2",
    titleSegments: [
      { text: "Education costs rise\n" },
      { text: " 8-10% ", highlighted: true },
      { text: " yearly" },
    ],
    description: "We build your nest to weather it.",
    renderIllustration: () => <Slide2Illustration />,
  },
  {
    id: "slide-3",
    titleSegments: [
      { text: "Your nest is built to\nweather all " },
      { text: " conditions. ", highlighted: true },
    ],
    description:
      "We'll adjust automatically through market changes, keeping your child's future secure.",
    renderIllustration: () => <Slide3Illustration />,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OnboardingScreenProps {
  onSkip?: () => void;
  onFinish?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen({
  onSkip,
  onFinish,
}: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const fillProgress = useRef(new Animated.Value(0)).current;

  // Start/restart the 10 s fill animation whenever the slide changes
  useEffect(() => {
    fillProgress.setValue(0);
    const anim = Animated.timing(fillProgress, {
      toValue: 1,
      duration: 10_000,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (!finished) return;
      const next = currentIndex + 1;
      if (next < SLIDES.length) {
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        setCurrentIndex(next);
      } else {
        onFinish?.();
      }
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const onListLayout = useCallback((e: LayoutChangeEvent) => {
    setListHeight(e.nativeEvent.layout.height);
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index ?? 0;
        setCurrentIndex(idx);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleSkip = () => {
    onSkip?.();
  };

  const renderSlide = ({ item, listHeight }: { item: OnboardingSlide; listHeight: number }) => (
    <View style={[styles.slide, listHeight > 0 && { height: listHeight }]}>
      {/* Title */}
      <Text style={styles.title}>
        {item.titleSegments.map((seg, i) =>
          seg.highlighted ? (
            <Text key={i} style={styles.titleHighlighted}>
              {seg.text}
            </Text>
          ) : (
            <Text key={i}>{seg.text}</Text>
          )
        )}
      </Text>

      {/* Illustration card */}
      <View style={styles.cardWrapper}>
        <OnboardingCard
          renderIllustration={item.renderIllustration}
          description={item.description}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top bar: progress + skip ── */}
      <View style={styles.topBar}>
        <ProgressBar total={SLIDES.length} currentIndex={currentIndex} fillProgress={fillProgress} />
        <Pressable style={styles.skipBtn} onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>skip {">"}</Text>
        </Pressable>
      </View>

      {/* ── Logo icon ── */}
      <View style={styles.logoRow}>
        <LogoVarient width={36} height={36} />
      </View>

      {/* ── Swipeable slides ── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        renderItem={({ item }) => renderSlide({ item, listHeight })}
        style={styles.flatList}
        onLayout={onListLayout}
        bounces={false}
        decelerationRate="fast"
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  topBar: {
    paddingTop: 12,
    paddingBottom: 4,
  },

  skipBtn: {
    position: "absolute",
    right: 20,
    top: 18,
  },

  skipText: {
    fontSize: 13,
    color: "#7A7A7A",
    fontWeight: "500",
  },

  logoRow: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },

  flatList: {
    flex: 1,
  },

  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#1A1A1A",
    lineHeight: 28,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  titleHighlighted: {
    color: "#10185A",
    fontWeight: "700",
    backgroundColor: "#7788DF73",
  },

  cardWrapper: {
    flex: 1,
  },
});

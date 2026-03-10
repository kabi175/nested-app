import {
    Fraunces_700Bold,
    useFonts,
} from "@expo-google-fonts/fraunces";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import Button from "./Button";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH * 0.8;
const CHART_HEIGHT = 200;

// SVG chart padding (inset from container edges)
const PAD_LEFT = 32;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

// Chart drawing area
const W = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
const H = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

/**
 * Exponential-looking cubic bezier path.
 * Starts bottom-left, ends top-right with a smooth upward sweep.
 * Control points chosen to mimic the reference image curve.
 */
const CURVE =
    `M ${PAD_LEFT} ${PAD_TOP + H}` +
    ` C ${PAD_LEFT + W * 0.55} ${PAD_TOP + H},` +
    `   ${PAD_LEFT + W * 0.75} ${PAD_TOP + H * 0.55},` +
    `   ${PAD_LEFT + W} ${PAD_TOP}`;

/** Closed path used for the amber fill under the curve */
const FILL_PATH =
    CURVE +
    ` L ${PAD_LEFT + W} ${PAD_TOP + H}` +
    ` L ${PAD_LEFT} ${PAD_TOP + H}` +
    " Z";

/**
 * Approximate arc-length of the cubic bezier.
 * Computed analytically via De Casteljau sampling — close enough for
 * dash-offset animation without a native path-length call.
 */
const CURVE_LENGTH = approximateCurveLength();

function approximateCurveLength(): number {
    // Sample 200 points on the bezier and sum segment lengths
    const x0 = PAD_LEFT,
        y0 = PAD_TOP + H;
    const cx1 = PAD_LEFT + W * 0.55,
        cy1 = PAD_TOP + H;
    const cx2 = PAD_LEFT + W * 0.75,
        cy2 = PAD_TOP + H * 0.55;
    const x3 = PAD_LEFT + W,
        y3 = PAD_TOP;

    let length = 0;
    let prevX = x0,
        prevY = y0;
    const steps = 200;

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const x =
            mt * mt * mt * x0 +
            3 * mt * mt * t * cx1 +
            3 * mt * t * t * cx2 +
            t * t * t * x3;
        const y =
            mt * mt * mt * y0 +
            3 * mt * mt * t * cy1 +
            3 * mt * t * t * cy2 +
            t * t * t * y3;
        const dx = x - prevX;
        const dy = y - prevY;
        length += Math.sqrt(dx * dx + dy * dy);
        prevX = x;
        prevY = y;
    }

    return length;
}

// ─── Animated SVG Path ────────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StudyAbroadScreenProps {
    onBack?: () => void;
    onStartPlanning?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudyAbroadScreen({
    onBack,
    onStartPlanning,
}: StudyAbroadScreenProps) {
    // ── Fonts ──────────────────────────────────────────────────────────────────
    const [fontsLoaded] = useFonts({ Fraunces_700Bold });

    // ── Shared animation values ────────────────────────────────────────────────
    const headlineOpacity = useSharedValue(0);
    const headlineTranslateY = useSharedValue(20);
    const subtitleOpacity = useSharedValue(0);
    const subtitleTranslateY = useSharedValue(20);
    const strokeProgress = useSharedValue(0); // 0 → 1
    const quoteOpacity = useSharedValue(0);
    const ctaScale = useSharedValue(0.88);
    const ctaOpacity = useSharedValue(0);

    // ── Animation sequence on mount ────────────────────────────────────────────
    useEffect(() => {
        // 1. Headline
        headlineOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
        headlineTranslateY.value = withDelay(100, withTiming(0, { duration: 500 }));

        // 2. Subtitle (staggered)
        subtitleOpacity.value = withDelay(280, withTiming(1, { duration: 450 }));
        subtitleTranslateY.value = withDelay(280, withTiming(0, { duration: 450 }));

        // 3. Chart stroke draws in
        strokeProgress.value = withDelay(550, withTiming(1, { duration: 1100 }));

        // 4. Quote fades in after chart finishes
        quoteOpacity.value = withDelay(1750, withTiming(1, { duration: 500 }));

        // 5. CTA scales in
        ctaScale.value = withDelay(1950, withSpring(1, { damping: 14 }));
        ctaOpacity.value = withDelay(1950, withTiming(1, { duration: 350 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Animated styles ────────────────────────────────────────────────────────
    const headlineStyle = useAnimatedStyle(() => ({
        opacity: headlineOpacity.value,
        transform: [{ translateY: headlineTranslateY.value }],
    }));

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
        transform: [{ translateY: subtitleTranslateY.value }],
    }));

    const quoteStyle = useAnimatedStyle(() => ({
        opacity: quoteOpacity.value,
    }));

    const ctaStyle = useAnimatedStyle(() => ({
        opacity: ctaOpacity.value,
        transform: [{ scale: ctaScale.value }],
    }));

    // ── Animated SVG path props (stroke draw-on) ───────────────────────────────
    const animatedPathProps = useAnimatedProps(() => ({
        strokeDashoffset: CURVE_LENGTH * (1 - strokeProgress.value),
    }));

    // ── Render ─────────────────────────────────────────────────────────────────
    const headlineFont = fontsLoaded ? "Fraunces_700Bold" : undefined;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ── Back button ── */}
            <Pressable style={styles.backButton} onPress={onBack} hitSlop={10}>
                <ChevronLeft size={20} color="#3C3C3C" strokeWidth={2.2} />
            </Pressable>

            {/* ── Scrollable/static content ── */}
            <View style={styles.content}>
                {/* Headline */}
                <Animated.View style={headlineStyle}>
                    <Text
                        style={[
                            styles.headline,
                            fontsLoaded && { fontFamily: headlineFont },
                        ]}
                    >
                        {"Studying abroad has\nnever been cheap"}
                    </Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.View style={subtitleStyle}>
                    <Text style={styles.subtitle}>
                        {"A 4-year abroad degree that cost ₹18L in 2010\ncosts ₹52L today."}
                    </Text>
                </Animated.View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    <Svg
                        width={CHART_WIDTH}
                        height={CHART_HEIGHT}
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    >
                        <Defs>
                            <LinearGradient id="amberFill" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor="#F5C842" stopOpacity={0.35} />
                                <Stop offset="100%" stopColor="#F5C842" stopOpacity={0.08} />
                            </LinearGradient>
                        </Defs>

                        {/* Axes */}
                        {/* Y-axis (vertical) */}
                        <Line
                            x1={PAD_LEFT}
                            y1={PAD_TOP}
                            x2={PAD_LEFT}
                            y2={PAD_TOP + H + 2}
                            stroke="#CCCCCC"
                            strokeWidth={1}
                        />
                        {/* X-axis (horizontal) */}
                        <Line
                            x1={PAD_LEFT - 2}
                            y1={PAD_TOP + H}
                            x2={PAD_LEFT + W + 12}
                            y2={PAD_TOP + H}
                            stroke="#CCCCCC"
                            strokeWidth={1}
                        />

                        {/* Amber fill under curve (static, shows with chart context) */}
                        <Path
                            d={FILL_PATH}
                            fill="url(#amberFill)"
                            stroke="none"
                        />

                        {/* Animated stroke — draws in left to right */}
                        <AnimatedPath
                            animatedProps={animatedPathProps}
                            d={CURVE}
                            fill="none"
                            stroke="#E6A800"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeDasharray={CURVE_LENGTH}
                        />
                    </Svg>

                    {/* X-axis year labels */}
                    <View style={styles.axisLabels}>
                        <Text style={styles.axisLabel}>2010</Text>
                        <Text style={styles.axisLabel}>2026</Text>
                    </View>
                </View>

                {/* Pull quote */}
                <Animated.View style={[styles.quoteContainer, quoteStyle]}>
                    <Text style={styles.quote}>
                        {"\"That's 3x in 15 years.\nAnd it's not slowing down.\""}
                    </Text>
                </Animated.View>
            </View>

            {/* ── Sticky bottom CTA ── */}
            <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
                <Button title="Start planning" onPress={onStartPlanning} />
            </Animated.View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FAFAF7",
    },

    // ── Back button ──────────────────────────────────────────────────────────
    backButton: {
        marginTop: 8,
        marginLeft: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#EBEBEB",
        alignItems: "center",
        justifyContent: "center",
    },

    // ── Main content area ─────────────────────────────────────────────────────
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 32,
    },

    // ── Headline ──────────────────────────────────────────────────────────────
    headline: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        lineHeight: 34,
        marginBottom: 12,
    },

    // ── Subtitle ──────────────────────────────────────────────────────────────
    subtitle: {
        fontSize: 13,
        color: "#888888",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 32,
    },

    // ── Chart ─────────────────────────────────────────────────────────────────
    chartContainer: {
        width: CHART_WIDTH,
        alignItems: "center",
        marginBottom: 28,
    },

    axisLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: CHART_WIDTH - PAD_LEFT / 2,
        alignSelf: "flex-end",
        paddingRight: PAD_RIGHT,
        marginTop: -6,
    },

    axisLabel: {
        fontSize: 11,
        color: "#AAAAAA",
        fontWeight: "500",
    },

    // ── Pull quote ────────────────────────────────────────────────────────────
    quoteContainer: {
        paddingHorizontal: 16,
    },

    quote: {
        fontSize: 20,
        fontWeight: "700",
        fontStyle: "italic",
        color: "#1A1A1A",
        textAlign: "center",
        lineHeight: 30,
    },

    // ── CTA ───────────────────────────────────────────────────────────────────
    ctaWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 12,
    },
});

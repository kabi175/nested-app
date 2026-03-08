import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Star } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "./Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Testimonial Data ─────────────────────────────────────────────────────────

const TESTIMONIALS = [
    {
        id: "1",
        name: "Priya Sharma",
        subtitle: "Software Engineer, Pune",
        rating: 5,
        text: "“I had a Groww account but it wasn't designed for my daughter's IIT dream. Nested showed me the gap — and a real plan to close it.”",
        label: "Switched from generic SIP",
        rotation: 5.31,
        zIndex: 1,
        topOffset: 0,
    },
    {
        id: "2",
        name: "Rahul & Deepa",
        subtitle: "Business Owners, Indore",
        rating: 5,
        text: "“We were putting money in FDs 'for the kids'. Our FD would have covered barely 40% of the actual cost. Nested opened our eyes.”",
        label: null,
        rotation: -2,
        zIndex: 2,
        topOffset: 200,
    },
    {
        id: "3",
        name: "Manoj Patel",
        subtitle: "Teacher, Ahmedabad",
        rating: 5,
        text: "“Starting with just ₹3,000 a month. Peace of mind..”",
        label: "Switched from RDs",
        rotation: 7,
        zIndex: 3,
        topOffset: 360,
    },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TestimonialScreenProps {
    childName?: string;
    onStartFund?: () => void;
    onBack?: () => void;
    onReadMore?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestimonialScreen({
    childName = "Aanya",
    onStartFund,
    onBack,
    onReadMore,
}: TestimonialScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={["#FFFAF5", "#FFFFFF", "#E8EEFF"]}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* ── Header ─────────────────────────────────────────── */}
                    <View style={styles.header}>
                        <Pressable
                            onPress={onBack}
                            style={styles.backButton}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <ArrowLeft size={22} color="#1A1A1A" />
                        </Pressable>

                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Parents like you</Text>
                            <Text style={styles.title}>already started.</Text>
                        </View>
                    </View>

                    {/* ── Testimonial Cards ──────────────────────────── */}
                    <View style={styles.cardsContainer}>
                        {TESTIMONIALS.map((t, index) => (
                            <View
                                key={t.id}
                                style={[
                                    styles.cardWrapper,
                                    {
                                        zIndex: t.zIndex,
                                        elevation: t.zIndex || 1, // Fixes Android stacking
                                        top: t.topOffset,
                                        transform: [{ rotate: `${t.rotation}deg` }],
                                    },
                                ]}
                            >
                                <View style={[styles.card, styles.cardShadow]}>
                                    {/* Card Header Profile */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.avatar}>
                                            {/* Using a simple blue circle as placeholder for avatar */}
                                        </View>
                                        <View style={styles.profileInfo}>
                                            <Text style={styles.profileName}>{t.name}</Text>
                                            <Text style={styles.profileSubtitle}>{t.subtitle}</Text>
                                        </View>
                                        {/* Stars */}
                                        <View style={styles.starsContainer}>
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} size={14} color="#FBBF24" fill="#FBBF24" strokeWidth={0} />
                                            ))}
                                        </View>
                                    </View>

                                    {/* Review Text */}
                                    <Text style={styles.reviewText}>{t.text}</Text>

                                    {/* Tag/Label */}
                                    {t.label && (
                                        <View style={styles.labelWrapper}>
                                            <Text style={styles.labelText}>{t.label}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                        {/* Spacer to push content down below absolute cards */}
                        <View style={{ height: 500 }} />
                    </View>

                    {/* ── Bottom Section ───────────────────────────── */}
                    <View style={styles.bottomSection}>
                        <Pressable onPress={onReadMore} style={styles.readMoreContainer}>
                            <Text style={styles.readMoreText}>Read more ↗</Text>
                        </Pressable>

                        <View style={styles.buttonWrapper}>
                            <Button
                                title={`Start ${childName}’s fund`}
                                onPress={onStartFund}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
        flexGrow: 1,
    },

    // Header
    header: {
        marginBottom: 40,
        alignItems: "center",
        position: "relative",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F0F0F0",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 10,
    },
    titleContainer: {
        alignItems: "center",
        marginTop: 64, // push below back button
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1A1A1A",
        lineHeight: 32,
        textAlign: "center",
    },

    // Cards Container
    cardsContainer: {
        position: "relative",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 10,
    },
    cardWrapper: {
        position: "absolute",
        width: SCREEN_WIDTH - 64, // matched to design lateral padding
        alignItems: "center",
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.05,
                shadowRadius: 36,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    card: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.02)",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#6B7AFF", // Blue circle matching design
        marginRight: 12,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 2,
    },
    profileSubtitle: {
        fontSize: 12,
        color: "#8E8E93",
    },
    starsContainer: {
        flexDirection: "row",
        gap: 3,
        marginLeft: 8,
    },
    reviewText: {
        fontSize: 15,
        color: "#1A1A1A",
        lineHeight: 22,
        fontWeight: "400",
        marginBottom: 16,
    },
    labelWrapper: {
        backgroundColor: "#F4F6FF", // Softer blue pill
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: "flex-start",
    },
    labelText: {
        fontSize: 11,
        color: "#4E6BF2",
        fontWeight: "600",
    },

    // Bottom Section
    bottomSection: {
        marginTop: "auto",
        paddingTop: 40,
        alignItems: "center",
    },
    readMoreContainer: {
        marginBottom: 24,
    },
    readMoreText: {
        fontSize: 14,
        color: "#7A7A7A",
        fontWeight: "500",
        textDecorationLine: "underline",
    },
    buttonWrapper: {
        width: "100%",
    },
});

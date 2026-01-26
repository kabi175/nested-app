import { Activity } from "@/api/activitiesAPI";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { FirstPendingActivityCard } from "@/components/FirstPendingActivityCard";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { usePendingActivities } from "@/hooks/usePendingActivities";
import { handleActivityNavigation } from "@/utils/activityNavigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Animated,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NomineeSuccessScreen() {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));
    const { data: activities } = usePendingActivities();
    const api = useAuthAxios();
    const queryClient = useQueryClient();
    const setCart = useSetAtom(cartAtom);
    const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);

    const firstActivity: Activity | undefined = activities?.[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContinue = async () => {
        if (firstActivity) {
            await handleActivityNavigation(
                firstActivity,
                api,
                queryClient,
                setCart,
                setGoalsForCustomize
            );
        } else {
            router.replace("/(tabs)/child");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <Layout level="1" style={styles.container}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={["#10B981", "#059669"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <CheckCircle size={64} color="#FFFFFF" strokeWidth={2.5} />
                        </LinearGradient>
                    </View>

                    {/* Success Message */}
                    <View style={styles.textContainer}>
                        <Text category="h3" style={styles.title}>
                            Nominees Saved Successfully!
                        </Text>
                        <Text category="s1" appearance="hint" style={styles.subtitle}>
                            Your nominee information has been verified and saved. Your
                            investment goals are now protected.
                        </Text>
                    </View>

                    {/* Pending Activity Card */}
                    <FirstPendingActivityCard showProceedButton={false} />

                    {/* Action Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            style={styles.continueButton}
                            size="large"
                            onPress={handleContinue}
                        >
                            {firstActivity ? "Continue" : "Go to Goals"}
                        </Button>
                    </View>
                </Animated.View>
            </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    title: {
        marginBottom: 16,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    subtitle: {
        lineHeight: 24,
        color: "#64748B",
        textAlign: "center",
    },
    buttonContainer: {
        width: "100%",
        paddingHorizontal: 20,
    },
    continueButton: {
        width: "100%",
    },
});

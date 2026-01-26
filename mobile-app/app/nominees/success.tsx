import { Activity } from "@/api/activitiesAPI";
import { GoalDTO, mapGoalToGoal } from "@/api/goalApi";
import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { usePendingActivities } from "@/hooks/usePendingActivities";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { Banknote, CheckCircle, IdCard, Landmark, UserCog } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NomineeSuccessScreen() {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));
    const { data: activities, isLoading: isLoadingActivities } =
        usePendingActivities();
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

    const renderActivityIcon = (activity: Activity) => {
        const iconColor = "#FFFFFF";
        const size = 18;

        switch (activity.type) {
            case "kyc_incomplete":
                return <IdCard size={size} color={iconColor} />;
            case "bank_account_pending":
                return <Banknote size={size} color={iconColor} />;
            case "goal_payment_pending":
                return <Landmark size={size} color={iconColor} />;
            case "profile_incomplete":
            default:
                return <UserCog size={size} color={iconColor} />;
        }
    };

    const handleActivityPress = async (activity: Activity) => {
        switch (activity.type) {
            case "kyc_incomplete":
                router.push("/kyc");
                break;
            case "bank_account_pending":
                router.push("/bank-accounts");
                break;
            case "goal_payment_pending":
                const goalDto = activity.metadata as GoalDTO;
                const goal = mapGoalToGoal(goalDto);
                const orders = await queryClient.fetchQuery({
                    queryKey: [QUERY_KEYS.pendingOrders, goal.id],
                    queryFn: () => getPendingOrdersByGoalId(api, goal.id),
                });
                if (orders && orders.length > 0) {
                    setCart(orders);
                    router.push("/payment");
                } else {
                    setGoalsForCustomize([goal]);
                    router.push({
                        pathname: `/child/${goal.childId}/goal/customize`,
                        params: {
                            goal_id: goal.id,
                        },
                    });
                }
                break;
            case "nominee_configuration_pending":
                router.push("/nominees");
                break;
            case "profile_incomplete":
            default:
                router.push("/account");
                break;
        }
    };

    const handleContinue = () => {
        if (firstActivity) {
            handleActivityPress(firstActivity);
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
                    {isLoadingActivities ? (
                        <View style={styles.activityCard}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text category="s2" style={styles.loadingText}>
                                Loading pending activities...
                            </Text>
                        </View>
                    ) : firstActivity ? (
                        <Pressable
                            style={styles.activityCard}
                            onPress={() => handleActivityPress(firstActivity)}
                        >
                            <View style={styles.activityLeftSection}>
                                <View style={styles.activityIconContainer}>
                                    {renderActivityIcon(firstActivity)}
                                </View>
                                <View style={styles.activityTextContainer}>
                                    <Text category="s1" style={styles.activityTitle}>
                                        {firstActivity.title}
                                    </Text>
                                    <Text category="c1" style={styles.activityDescription}>
                                        {firstActivity.description}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.activityRightSection}>
                                <Text style={styles.activityCtaText}>Proceed</Text>
                            </View>
                        </Pressable>
                    ) : null}

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
    activityCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 32,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    activityLeftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    activityIconContainer: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#F97316",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        fontWeight: "600",
        marginBottom: 4,
        color: "#111827",
    },
    activityDescription: {
        color: "#6B7280",
        lineHeight: 18,
    },
    activityRightSection: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#111827",
    },
    activityCtaText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    loadingText: {
        marginTop: 8,
        color: "#6B7280",
    },
    buttonContainer: {
        width: "100%",
        paddingHorizontal: 20,
    },
    continueButton: {
        width: "100%",
    },
});

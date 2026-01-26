import { Activity } from "@/api/activitiesAPI";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { usePendingActivities } from "@/hooks/usePendingActivities";
import { handleActivityNavigation } from "@/utils/activityNavigation";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@ui-kitten/components";
import { useSetAtom } from "jotai";
import { Banknote, IdCard, Landmark, UserCog } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

export function FirstPendingActivityCard({ showProceedButton = true }: { showProceedButton?: boolean }) {
    const { data: activities, isLoading: isLoadingActivities } =
        usePendingActivities();
    const api = useAuthAxios();
    const queryClient = useQueryClient();
    const setCart = useSetAtom(cartAtom);
    const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);

    const firstActivity: Activity | undefined = activities?.[0];

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
        await handleActivityNavigation(
            activity,
            api,
            queryClient,
            setCart,
            setGoalsForCustomize
        );
    };

    if (isLoadingActivities) {
        return (
            <View style={styles.activityCard}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text category="s2" style={styles.loadingText}>
                    Loading pending activities...
                </Text>
            </View>
        );
    }

    if (!firstActivity) {
        return null;
    }

    return (
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
            {showProceedButton && (
                <View style={styles.activityRightSection}>
                    <Text style={styles.activityCtaText}>Proceed</Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
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
});

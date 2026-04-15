import { logCustomPortfolioScreen, logProceedWithCustomPlan } from "@/services/analytics";
import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import BackButton from "@/components/v2/BackButton";
import Button from "@/components/v2/Button";
import ModeToggle, { PlannerMode } from "@/components/v2/planner/ModeToggle";
import SipBasedPlan from "@/components/v2/planner/SipBasedPlan";
import TargetBasedPlan from "@/components/v2/planner/TargetBasedPlan";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoal } from "@/hooks/useGoal";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { useUpdateGoal } from "@/hooks/useUpdateGoal";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSetAtom } from "jotai";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_TARGET_AMOUNT = 25_00_000; // ₹25L

function getSipStartDate(): Date {
    const d = new Date();
    if (d.getDate() > 28) {
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
    }
    return d;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Planner() {
    const { goal_id } = useLocalSearchParams<{ goal_id: string }>();
    const insets = useSafeAreaInsets();

    const { data: goal } = useGoal(goal_id);
    const child_id = goal?.child?.id;
    const updateGoalMutation = useUpdateGoal();
    const createGoalMutation = useGoalCreation();
    const createOrdersMutation = useCreateOrders();
    const setCart = useSetAtom(cartAtom);

    const sipMin = goal?.basket.min_sip || 4000;
    const targetYear = goal?.targetDate.getFullYear() || (new Date().getFullYear() + 1);
    const remainingYears = targetYear - new Date().getFullYear();

    const [mode, setMode] = useState<PlannerMode>("target");

    React.useEffect(() => { logCustomPortfolioScreen(); }, []);

    // Captured from whichever plan component is active
    const planSip = useRef(0);
    const planTarget = useRef(DEFAULT_TARGET_AMOUNT);
    const planLumpsum = useRef(0);

    const handleSubmit = async () => {
        const displaySip = planSip.current;
        const displayTarget = planTarget.current;
        const lumpSum = planLumpsum.current;

        logProceedWithCustomPlan({ sip_amount: displaySip, lump_sum: lumpSum });

        if (remainingYears <= 0) {
            Alert.alert("Invalid date", "The target year has already passed.");
            return;
        }
        if (displayTarget < 1_00_000) {
            Alert.alert("Target too low", "Please set a target of at least ₹1L.");
            return;
        }
        if (displaySip < 500) {
            Alert.alert("SIP too low", "Monthly SIP must be at least ₹500.");
            return;
        }
        if (lumpSum > 0 && lumpSum < 1_000) {
            Alert.alert("Lump sum too low", "Lump sum must be at least ₹1,000.");
            return;
        }

        try {
            if (!goal) return;

            updateGoalMutation.mutateAsync({
                goal: {
                    id: goal.id,
                    target_amount: displayTarget,
                    title: goal.title,
                    target_date: goal.targetDate,
                },
            });

            const orders: CreateOrderRequest[] = [
                {
                    type: "sip",
                    amount: displaySip,
                    start_date: getSipStartDate(),
                    goalId: goal.id,
                },
            ];

            if (lumpSum > 0) {
                orders.push({
                    type: "buy",
                    amount: lumpSum,
                    goalId: goal.id,
                });
            }

            const createdOrders = await createOrdersMutation.mutateAsync({ orders });
            setCart(createdOrders);
            router.replace({ pathname: "/child/[child_id]/loader", params: { child_id } });
        } catch {
            Alert.alert("Something went wrong", "Please try again.");
        }
    };

    const isLoading = createGoalMutation.isPending || createOrdersMutation.isPending;
    const childName = goal?.child?.name ?? "your child";

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <StatusBar style="dark" backgroundColor="#FAFAFA" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.push("/(tabs)")} />
                    <Text style={styles.title}>
                        Let&apos;s build a perfect nest for{"\n"}{childName}
                    </Text>
                </View>

                {/* Mode toggle */}
                <ModeToggle mode={mode} onChange={setMode} />

                {/* Active plan component */}
                {mode === "target" ? (
                    <TargetBasedPlan
                        defaultTarget={DEFAULT_TARGET_AMOUNT}
                        targetYear={targetYear}
                        remainingYears={remainingYears}
                        onSipChange={(v) => { planSip.current = v; }}
                        onTargetChange={(v) => { planTarget.current = v; }}
                        onLumpsumChange={(v) => { planLumpsum.current = v; }}
                    />
                ) : (
                    <SipBasedPlan
                        defaultTarget={DEFAULT_TARGET_AMOUNT}
                        targetYear={targetYear}
                        remainingYears={remainingYears}
                        sipMin={sipMin}
                        onSipChange={(v) => { planSip.current = v; }}
                        onTargetChange={(v) => { planTarget.current = v; }}
                        onLumpsumChange={(v) => { planLumpsum.current = v; }}
                    />
                )}

                {/* Push notice + CTA to bottom */}
                <View style={{ flex: 1 }} />

                <View style={styles.section}>
                    <View style={styles.noticeCard}>
                        <Text style={styles.noticeText}>Small contribution, big growth</Text>
                    </View>
                </View>
                <View style={[styles.section, { paddingBottom: insets.bottom + 16 }]}>
                    <Button
                        title="That works for me"
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    header: {
        gap: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1D1E20",
        lineHeight: 32,
        textAlign: "center",
    },
    section: {
        marginTop: 16,
    },
    noticeCard: {
        borderWidth: 1,
        borderColor: "#C5CEE0",
        borderStyle: "dashed",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        backgroundColor: "#6F85F50F",
    },
    noticeText: {
        fontSize: 14,
        color: "#6E6F7A",
        textAlign: "center",
    },
});

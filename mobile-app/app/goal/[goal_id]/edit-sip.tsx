import Button from "@/components/v2/Button";
import GoalHeader from "@/components/v2/goal/GoalHeader";
import Slider from "@/components/v2/Slider";
import { useGoal } from "@/hooks/useGoal";
import { useModifySipOrder } from "@/hooks/useModifySipOrder";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEP_UP_OPTIONS = [0, 500, 1000, 1500, 2000, 2500, 3000];
const MIN_SIP = 3000;
const MAX_SIP = 1_00_000;
const RATE_OF_RETURN = 0.12; // 12% annual

function computeCorpus(monthlySip: number, stepUpAmount: number, years: number): number {
    let corpus = 0;
    let currentSip = monthlySip;
    const monthlyRate = RATE_OF_RETURN / 12;
    for (let y = 0; y < years; y++) {
        for (let m = 0; m < 12; m++) {
            corpus = (corpus + currentSip) * (1 + monthlyRate);
        }
        currentSip = currentSip + stepUpAmount;
    }
    return corpus;
}

function computeInvested(monthlySip: number, stepUpAmount: number, years: number): number {
    let total = 0;
    let currentSip = monthlySip;
    for (let y = 0; y < years; y++) {
        total += currentSip * 12;
        currentSip = currentSip + stepUpAmount;
    }
    return total;
}

function formatLakh(amount: number): string {
    const lakh = amount / 100000;
    if (lakh >= 100) {
        return `₹${(lakh / 100).toFixed(1)} Cr`;
    }
    if (lakh >= 1) {
        return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
    }
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatLakhShort(amount: number): string {
    const lakh = amount / 100000;
    if (lakh >= 1) {
        return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
    }
    return `${Math.round(amount / 1000)}k`;
}

export default function EditSipScreen() {
    const { goal_id, sip_order_id } = useLocalSearchParams<{ goal_id: string; sip_order_id: string }>();
    const { data: goal, isLoading: goalLoading } = useGoal(goal_id);

    const [monthlySip, setMonthlySip] = useState(MIN_SIP);
    const [stepUpIndex, setStepUpIndex] = useState(0);

    // Initialize slider and step-up from the fetched goal once available
    useEffect(() => {
        if (!goal) return;
        if (goal.monthlySip != null) {
            setMonthlySip(goal.monthlySip);
        }
        setStepUpIndex(0);
    }, [goal]);

    const modifyMutation = useModifySipOrder();
    const queryClient = useQueryClient();
    const [mandateAuthInProgress, setMandateAuthInProgress] = useState(false);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll goal every 5 sec while waiting for mandate authorization
    useEffect(() => {
        if (mandateAuthInProgress) {
            pollIntervalRef.current = setInterval(() => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal, goal_id] });
            }, 5000);
        } else {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [mandateAuthInProgress]);

    // Navigate back once modification is in PENDING state (mandate authorized)
    useEffect(() => {
        if (!mandateAuthInProgress || !goal) return;
        if (goal.hasPendingSipModification) {
            router.back();
        }
    }, [mandateAuthInProgress, goal?.hasPendingSipModification]);

    const targetYears = goal
        ? Math.max(1, new Date(goal.targetDate).getFullYear() - new Date().getFullYear())
        : 12;
    const targetYear = new Date().getFullYear() + targetYears;

    const stepUpAmount = STEP_UP_OPTIONS[stepUpIndex];
    const corpus = computeCorpus(monthlySip, stepUpAmount, targetYears);
    const invested = computeInvested(monthlySip, stepUpAmount, targetYears);
    const returns = corpus - invested;
    // Clamp fraction so the bar is always visually meaningful
    const investedFraction = Math.min(Math.max(invested / corpus, 0.05), 0.95);

    const handleSave = async () => {
        if (!sip_order_id) {
            Alert.alert("Error", "SIP order not found. Please try again.");
            return;
        }
        try {
            const result = await modifyMutation.mutateAsync({ sipOrderId: sip_order_id, amount: monthlySip });
            if (result.mandate_url) {
                await Linking.openURL(result.mandate_url);
                setMandateAuthInProgress(true);
            } else {
                router.back();
            }
        } catch (e: any) {
            if (e?.response?.status === 409) {
                Alert.alert(
                    "Pending Modification",
                    "A modification is already in progress. Please wait before submitting another."
                );
            } else {
                Alert.alert("Error", e?.response?.data?.error ?? "Failed to update SIP");
            }
        }
    };

    if (goalLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <GoalHeader title="Edit SIP" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3137D5" />
                </View>
            </SafeAreaView>
        );
    }

    if (mandateAuthInProgress) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <GoalHeader title="Edit SIP" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3137D5" />
                    <Text style={styles.mandateText}>Authorizing mandate…</Text>
                    <Text style={styles.mandateSubText}>
                        Complete authorization in the browser. This screen will update automatically.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <GoalHeader title="Edit SIP" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Monthly SIP Slider */}
                <Slider
                    min={MIN_SIP}
                    max={MAX_SIP}
                    step={1000}
                    value={monthlySip}
                    onValueChange={setMonthlySip}
                />

                {/* Nest Growth Card */}
                <View style={styles.growthCard}>
                    <Text style={styles.growthLabel}>YOUR NEST WILL GROW TO</Text>
                    <Text style={styles.growthAmount}>{formatLakh(corpus)}</Text>
                    <Text style={styles.growthSubtitle}>
                        {"By "}{targetYear}{"  •  "}{targetYears}{" years from now"}
                    </Text>

                    {/* Progress bar */}
                    <View style={styles.progressBarTrack}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${investedFraction * 100}%` },
                            ]}
                        />
                    </View>

                    <View style={styles.progressLabels}>
                        <View>
                            <Text style={styles.progressLabelTitle}>What you invest</Text>
                            <Text style={styles.progressLabelAmount}>({formatLakhShort(invested)})</Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={styles.progressLabelTitle}>What you get</Text>
                            <Text style={styles.progressLabelAmount}>({formatLakhShort(returns)})</Text>
                        </View>
                    </View>
                </View>

                {/* Step-Up Card */}
                <View style={styles.stepUpCard}>
                    <View style={styles.stepUpLeft}>
                        <Text style={styles.stepUpTitle}>STEP-UP</Text>
                        <Text style={styles.stepUpSubtitle}>Add a fixed amount to SIP each year</Text>
                    </View>
                    <View style={styles.stepper}>
                        <Pressable
                            onPress={() =>
                                setStepUpIndex((i) => Math.min(i + 1, STEP_UP_OPTIONS.length - 1))
                            }
                            hitSlop={10}
                        >
                            <ChevronUp size={13} color="#3A3A4A" strokeWidth={2.5} />
                        </Pressable>
                        <Text style={styles.stepperValue}>{stepUpAmount === 0 ? "₹0" : `+₹${stepUpAmount}`}</Text>
                        <Pressable
                            onPress={() => setStepUpIndex((i) => Math.max(i - 1, 0))}
                            hitSlop={10}
                        >
                            <ChevronDown size={13} color="#3A3A4A" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={modifyMutation.isPending ? "Saving..." : "Save plan"}
                    onPress={handleSave}
                    disabled={modifyMutation.isPending}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F4EF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 120,
        gap: 12,
    },
    // ── Growth Card ──────────────────────────────────────────────────────────────
    growthCard: {
        backgroundColor: "#E8E8E8",
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 18,
    },
    growthLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    growthAmount: {
        fontSize: 44,
        fontWeight: "700",
        color: "#111111",
        letterSpacing: -1.5,
        marginBottom: 4,
    },
    growthSubtitle: {
        fontSize: 13,
        color: "#6E6F7A",
        marginBottom: 20,
    },
    progressBarTrack: {
        height: 10,
        borderRadius: 5,
        backgroundColor: "#BEBEDE",
        marginBottom: 12,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#3137D5",
        borderRadius: 5,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressLabelTitle: {
        fontSize: 13,
        color: "#1D1E20",
        fontWeight: "400",
    },
    progressLabelAmount: {
        fontSize: 13,
        color: "#1D1E20",
        fontWeight: "400",
    },
    // ── Step-Up Card ─────────────────────────────────────────────────────────────
    stepUpCard: {
        backgroundColor: "#E8E8E8",
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    stepUpLeft: {
        flex: 1,
        marginRight: 16,
    },
    stepUpTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    stepUpSubtitle: {
        fontSize: 13,
        color: "#6E6F7A",
    },
    stepper: {
        borderWidth: 1,
        borderColor: "#C8C8D0",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: "center",
        backgroundColor: "#F5F4EF",
        minWidth: 76,
        gap: 2,
    },
    stepperValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1D1E20",
        paddingVertical: 2,
    },
    mandateText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#1D1E20",
        marginTop: 16,
        textAlign: "center",
    },
    mandateSubText: {
        fontSize: 13,
        color: "#6E6F7A",
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 32,
    },
    // ── Footer ───────────────────────────────────────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: "#F5F4EF",
    },
});

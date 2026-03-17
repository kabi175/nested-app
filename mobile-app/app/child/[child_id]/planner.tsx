import { CreateOrderRequest } from "@/api/paymentAPI";
import BackButton from "@/components/v2/BackButton";
import Button from "@/components/v2/Button";
import OutlineButton from "@/components/v2/OutlineButton";
import Slider from "@/components/v2/Slider";
import { LumpSumInput } from "@/components/v2/planner/LumpSumInput";
import ModeToggle, { PlannerMode } from "@/components/v2/planner/ModeToggle";
import NestGrowthCard from "@/components/v2/planner/NestGrowthCard";
import { useChild } from "@/hooks/useChildren";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { formatCurrency } from "@/utils/formatters";
import { computeMinimumSIPAmount } from "@/utils/sip";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPECTED_RETURNS = 12; // % p.a.
const DEFAULT_TARGET_AMOUNT = 25_00_000; // ₹25L

/**
 * Generates 4 evenly-spaced quick-select options starting from sipMin.
 * Step = sipMin * 0.5, rounded to nearest 500 (min step 500).
 * Each option is also rounded to nearest 500.
 */
function computeQuickSelectOptions(sipMin: number): number[] {
    const step = Math.max(500, Math.round((sipMin * 0.5) / 500) * 500);
    return Array.from({ length: 4 }, (_, i) =>
        Math.round((sipMin + i * step) / 500) * 500
    );
}

/** Slider max = last quick-select option + one more step, rounded to nearest 1000. */
function computeSliderMax(sipMin: number): number {
    const step = Math.max(500, Math.round((sipMin * 0.5) / 500) * 500);
    const lastOption = Math.round((sipMin + 3 * step) / 500) * 500;
    return Math.round((lastOption + step) / 1000) * 1000;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSipStartDate(): Date {
    const d = new Date();
    if (d.getDate() > 28) {
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
    }
    return d;
}

function computeTargetFromSIP(
    sipAmount: number,
    remainingYears: number,
    lumpsum: number
): number {
    const r_m = EXPECTED_RETURNS / 12 / 100;
    const n = remainingYears * 12;
    const fvSip = sipAmount * ((Math.pow(1 + r_m, n) - 1) / r_m);
    const fvLump = lumpsum * Math.pow(1 + r_m, n);
    return Math.round(fvSip + fvLump);
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function Planner() {
    const { child_id } = useLocalSearchParams<{ child_id: string }>();
    const insets = useSafeAreaInsets();

    const { data: child } = useChild(child_id);
    const createGoalMutation = useGoalCreation();
    const createOrdersMutation = useCreateOrders();

    const sipMin = 4000; //TODO: compute this value based on goal
    const quickSelectOptions = computeQuickSelectOptions(sipMin);
    const sliderMax = computeSliderMax(sipMin);

    const targetYear = useMemo(() => {
        if (!child?.dateOfBirth) return new Date().getFullYear() + 18;
        return child.dateOfBirth.getFullYear() + 18;
    }, [child]);

    const remainingYears = targetYear - new Date().getFullYear();

    // ── State ──
    const [mode, setMode] = useState<PlannerMode>("target");
    const [targetAmount, setTargetAmount] = useState(DEFAULT_TARGET_AMOUNT);
    const [sipAmount, setSipAmount] = useState(() =>
        computeMinimumSIPAmount(remainingYears > 0 ? remainingYears : 1, 0, 0, EXPECTED_RETURNS, DEFAULT_TARGET_AMOUNT)
    );
    const [lumpSumEnabled, setLumpSumEnabled] = useState(false);
    const [lumpSumStr, setLumpSumStr] = useState("");

    const lumpSum = lumpSumEnabled ? (parseInt(lumpSumStr, 10) || 0) : 0;

    // ── Derived values ──
    const years = remainingYears > 0 ? remainingYears : 1;

    const computedSip = useMemo(
        () => computeMinimumSIPAmount(years, 0, lumpSum, EXPECTED_RETURNS, targetAmount),
        [years, lumpSum, targetAmount]
    );

    const computedTarget = useMemo(
        () => computeTargetFromSIP(sipAmount, years, lumpSum),
        [sipAmount, years, lumpSum]
    );

    const displayTarget = mode === "target" ? targetAmount : computedTarget;
    const displaySip = mode === "target" ? computedSip : sipAmount;
    const totalInvested = displaySip * years * 12 + lumpSum;

    // ── Handlers ──
    const handleModeChange = (newMode: PlannerMode) => {
        setMode(newMode);
        if (newMode === "sip") {
            // seed slider from current computed SIP
            const clamped = Math.min(Math.max(computedSip, sipMin), sliderMax);
            setSipAmount(clamped);
        }
    };

    const handleTargetAmountChange = (amount: number) => {
        setTargetAmount(amount);
    };

    const handleSipSliderChange = (value: number) => {
        setSipAmount(value);
    };

    const handleLumpSumToggle = (enabled: boolean) => {
        setLumpSumEnabled(enabled);
        if (!enabled) setLumpSumStr("");
    };

    const handleSubmit = async () => {
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
        if (lumpSumEnabled && lumpSum < 1_000) {
            Alert.alert("Lump sum too low", "Lump sum must be at least ₹1,000.");
            return;
        }

        try {
            const [goal] = await createGoalMutation.mutateAsync([
                {
                    childId: child_id,
                    educationId: "",
                    title: `${child?.firstName ?? "Child"}'s Nest`,
                    targetAmount: displayTarget,
                    targetDate: new Date(targetYear, 5, 1),
                },
            ]);

            const orders: CreateOrderRequest[] = [
                {
                    type: "sip",
                    amount: displaySip,
                    start_date: getSipStartDate(),
                    goalId: goal.id,
                },
            ];

            if (lumpSumEnabled && lumpSum > 0) {
                orders.push({
                    type: "buy",
                    amount: lumpSum,
                    goalId: goal.id,
                });
            }

            await createOrdersMutation.mutateAsync({ orders });
            router.replace("/child");
        } catch {
            Alert.alert("Something went wrong", "Please try again.");
        }
    };

    const isLoading =
        createGoalMutation.isPending || createOrdersMutation.isPending;

    const childName = child?.firstName ?? "your child";

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.back()} />
                    <Text style={styles.title}>
                        Let's build a perfect nest for{"\n"}{childName}
                    </Text>
                </View>

                {/* Mode toggle */}
                <ModeToggle mode={mode} onChange={handleModeChange} />

                {/* Growth card */}
                <View style={styles.section}>
                    <NestGrowthCard
                        targetAmount={displayTarget}
                        editable={mode === "target"}
                        onAmountChange={handleTargetAmountChange}
                        targetYear={targetYear}
                        remainingYears={remainingYears}
                        totalInvested={totalInvested}
                    />
                </View>

                {/* Mode-specific section */}
                {mode === "target" ? (
                    <View style={styles.sipReadonlyCard}>
                        <Text style={styles.sipReadonlyLabel}>MONTHLY SIP</Text>
                        <Text style={styles.sipReadonlyValue}>{formatCurrency(computedSip)}</Text>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Slider
                            variant="default"
                            label="MONTHLY SIP"
                            min={sipMin}
                            max={sliderMax}
                            step={100}
                            value={sipAmount}
                            onValueChange={handleSipSliderChange}
                        />
                        {/* Quick select */}
                        <View style={styles.quickSelectHeader}>
                            <Text style={styles.quickSelectLabel}>QUICK SELECT</Text>
                        </View>
                        <View style={styles.quickSelectRow}>
                            {quickSelectOptions.map((opt) => (
                                <Pressable
                                    key={opt}
                                    style={[
                                        styles.quickChip,
                                        sipAmount === opt && styles.quickChipActive,
                                    ]}
                                    onPress={() => setSipAmount(opt)}
                                >
                                    <Text
                                        style={[
                                            styles.quickChipText,
                                            sipAmount === opt && styles.quickChipTextActive,
                                        ]}
                                    >
                                        {formatCurrency(opt)}{"\n"}/mo
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Lump sum */}
                <View style={styles.section}>
                    <LumpSumInput
                        enabled={lumpSumEnabled}
                        onToggle={handleLumpSumToggle}
                        amount={lumpSumStr}
                        onAmountChange={setLumpSumStr}
                    />
                </View>

                {/* Outline CTA */}
                <View style={styles.section}>
                    <OutlineButton title="Small contribution, big growth" />
                </View>

                {/* Spacer for fixed bottom button */}
                <View style={{ height: 90 + insets.bottom }} />
            </ScrollView>

            {/* Fixed bottom button */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title="That works for me"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                />
            </View>
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
    sipReadonlyCard: {
        backgroundColor: "#F4F5F6",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    sipReadonlyLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    sipReadonlyValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1D1E20",
    },
    quickSelectHeader: {
        marginTop: 20,
        marginBottom: 10,
    },
    quickSelectLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.5,
    },
    quickSelectRow: {
        flexDirection: "row",
        gap: 10,
    },
    quickChip: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    quickChipActive: {
        backgroundColor: "#3137D5",
        borderColor: "#3137D5",
    },
    quickChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1D1E20",
        textAlign: "center",
        lineHeight: 18,
    },
    quickChipTextActive: {
        color: "#FFFFFF",
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#E5E5E5",
    },
});

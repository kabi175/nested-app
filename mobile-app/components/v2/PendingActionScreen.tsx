import React, { useMemo } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "./Button";

// SVGs
import Nest from "../../assets/images/v2/nest.svg";
import Cap from "../../assets/images/v2/pending-actions/cap.svg";
import Destination from "../../assets/images/v2/pending-actions/destination.svg";
import Fort from "../../assets/images/v2/pending-actions/fort.svg";
import Money from "../../assets/images/v2/pending-actions/money.svg";
import Egg from "./Egg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Helper for Month generation ---
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface PendingActionScreenProps {
    onContinue?: () => void;
    onDoLater?: () => void;
    /** Pass a 0-11 index representing the current month. Defaults to the actual current month. */
    currentMonthIndex?: number;
}

export default function PendingActionScreen({
    onContinue,
    onDoLater,
    currentMonthIndex = 2, // Default to MAR for matching design visually
}: PendingActionScreenProps) {
    const insets = useSafeAreaInsets();

    // Generate 5 months to display around the current month (2 before, current, 2 after)
    const visibleMonths = useMemo(() => {
        const months = [];
        for (let i = -2; i <= 2; i++) {
            let index = (currentMonthIndex + i) % 12;
            if (index < 0) index += 12;

            months.push({
                name: MONTHS[index],
                offset: i,
            });
        }
        return months;
    }, [currentMonthIndex]);

    return (
        <View style={styles.container}>
            <View style={styles.contentArea}>

                {/* Circular clipping container for the fort */}
                <View style={styles.fortCircle}>
                    <Fort width={SCREEN_WIDTH * 1.4} height={SCREEN_WIDTH * 1.4} preserveAspectRatio="xMidYMin slice" />
                </View>

                {/* Money SVG on top of Fort roof */}
                <View style={styles.moneyWrapper}>
                    <Money width={93} height={93} />
                </View>

                {/* Dynamic Month Pills */}
                <View style={styles.monthsContainer}>
                    {visibleMonths.map((m, idx) => {
                        const isPast = m.offset < 0;
                        const isCurrent = m.offset === 0;
                        const isFuture = m.offset > 0;

                        return (
                            <View
                                key={`${m.name}-${idx}`}
                                style={[
                                    styles.monthPill,
                                    isPast && styles.monthPillPast,
                                    isCurrent && styles.monthPillCurrent,
                                    isFuture && styles.monthPillFuture,
                                ]}
                            >
                                <Text style={[
                                    styles.monthText,
                                    isPast && styles.monthTextPast,
                                    isCurrent && styles.monthTextCurrent,
                                    isFuture && styles.monthTextFuture,
                                ]}>
                                    {m.name}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Destination SVG: The Flag and dotted line connecting nest & fort */}
                <View style={styles.destinationWrapper}>
                    <Destination width={227} height={373} preserveAspectRatio="xMidYMid meet" />
                </View>

                {/* Nest Component */}
                <View style={styles.nestWrapper}>
                    <View style={{ width: 180, height: 180, position: 'relative' }}>
                        {/* Left Egg (Yellow) - Further back, slightly lower */}
                        <View style={{ position: 'absolute', left: 34, top: 32, width: 65, height: 85, zIndex: 1, opacity: 0.85 }}>
                            <Egg width={65} height={85} color="#F2BC79" animated={false} />
                        </View>
                        {/* Left Cap */}
                        <View style={{ position: 'absolute', left: 36, top: 4, width: 62, height: 62, zIndex: 2 }}>
                            <Cap width={62} height={62} />
                        </View>

                        {/* Right Egg (Blue) - In front, slightly taller */}
                        <View style={{ position: 'absolute', left: 88, top: 20, width: 75, height: 95, zIndex: 3, opacity: 0.9 }}>
                            <Egg width={75} height={95} color="#63B0F2" animated={false} />
                        </View>
                        {/* Right Cap */}
                        <View style={{ position: 'absolute', left: 95, top: -14, width: 64, height: 64, zIndex: 4, transform: [{ rotate: '-12deg' }] }}>
                            <Cap width={64} height={64} />
                        </View>

                        {/* Nest over front of lower egg halves */}
                        <View style={{ position: 'absolute', left: -5, top: 55, width: 190, height: 110, zIndex: 5 }}>
                            <Nest width={190} height={110} />
                        </View>
                    </View>
                </View>

            </View>

            {/* --- Bottom Action Section --- */}
            <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Complete KYC →"
                        onPress={onContinue}
                    />
                </View>

                <Pressable onPress={onDoLater} style={styles.doLaterContainer}>
                    <Text style={styles.doLaterText}>I’ll do later</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EFF1F4",
    },
    contentArea: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    fortCircle: {
        width: SCREEN_WIDTH * 1.45,
        height: SCREEN_WIDTH * 1.45,
        borderRadius: SCREEN_WIDTH,
        overflow: 'hidden',
        position: 'absolute',
        top: -SCREEN_WIDTH * 0.55,
        alignSelf: 'center',
        zIndex: 1,
    },
    moneyWrapper: {
        position: 'absolute',
        top: '18%',
        alignSelf: 'center',
        zIndex: 2,
    },

    // -- Months Container --
    monthsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '33%',
        width: '100%',
        zIndex: 3,
        gap: 12,
    },
    monthPill: {
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    monthPillPast: {
        backgroundColor: '#4E6BF2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        opacity: 0.8,
        shadowColor: "#4E6BF2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        transform: [{ scale: 0.9 }],
    },
    monthPillCurrent: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#3137D5',
        paddingVertical: 12,
        paddingHorizontal: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        transform: [{ scale: 1.1 }],
    },
    monthPillFuture: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        transform: [{ scale: 0.9 }],
    },

    monthText: {
        fontSize: 14,
        fontWeight: '700',
    },
    monthTextPast: {
        color: '#FFFFFF',
    },
    monthTextCurrent: {
        color: '#1A1A1A',
        fontSize: 16,
    },
    monthTextFuture: {
        color: '#1A1A1A',
    },

    // -- Destination & Nest --
    destinationWrapper: {
        position: 'absolute',
        bottom: 90,
        right: 40,
        zIndex: 4,
        transform: [{ scale: 0.85 }],
    },
    nestWrapper: {
        position: 'absolute',
        bottom: 60,
        left: 30,
        zIndex: 5,
        transform: [{ scale: 0.75 }],
    },

    // -- Bottom Section --
    bottomSection: {
        paddingHorizontal: 24,
        paddingTop: 0,
        alignItems: "center",
        backgroundColor: "#EFF1F4",
    },
    buttonWrapper: {
        width: "100%",
        marginBottom: 20,
    },
    doLaterContainer: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    doLaterText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
    },
});

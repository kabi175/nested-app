import React, { useMemo } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Button from "./Button";
import NestEggs from "./NestEggs"; // Using the nest from the other conversation

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
    currentMonthIndex = new Date().getMonth(),
}: PendingActionScreenProps) {
    const insets = useSafeAreaInsets();

    // Generate 5 months to display around the current month (2 before, current, 2 after)
    const visibleMonths = useMemo(() => {
        const months = [];
        for (let i = -2; i <= 2; i++) {
            // Handle wrap-around for month indexing
            let index = (currentMonthIndex + i) % 12;
            if (index < 0) index += 12;

            months.push({
                name: MONTHS[index],
                offset: i, // -2, -1, 0, 1, 2
            });
        }
        return months;
    }, [currentMonthIndex]);

    return (
        <View style={styles.container}>
            <View style={styles.contentArea}>

                {/* --- Background Placeholder (Building & Flag) --- */}
                <View style={styles.backgroundIllustration}>
                    <View style={styles.skyPlaceholder} />
                    <View style={styles.buildingPlaceholder}>
                        <View style={styles.buildingPillar} />
                        <View style={styles.buildingPillar} />
                        <View style={styles.buildingPillar} />
                    </View>
                </View>


                {/* --- Dynamic Month Pills --- */}
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

                {/* --- Dotted Path (S-Curve) --- */}
                <View style={styles.pathContainer}>
                    <Svg width="100%" height="150" viewBox="0 0 200 150">
                        <Path
                            d="M180,20 C180,60 40,60 40,100 C40,140 180,140 180,140"
                            fill="none"
                            stroke="#5A6C82" // Dark greyish-blue for dots
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="0, 15" // Creates the dotted effect
                        />
                    </Svg>
                </View>

                {/* --- Nest with Eggs (Placeholder since missing grad-cap eggs) --- */}
                <View style={styles.nestContainer}>
                    {/* The NestEggs component likely animates or displays the eggs. 
                We place it relatively positioned to align with the bottom of the dotted path */}
                    <NestEggs
                        children={[
                            { id: '1', color: '#4E6BF2' },
                            { id: '2', color: '#4E6BF2' },
                            { id: '3', color: '#4E6BF2' }
                        ]}
                        selectedChildId="3"
                        onSelectChild={() => { }}
                    />
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
        backgroundColor: "#EFF1F4", // Light gray overall background matching the image edges
    },
    contentArea: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },

    // -- Background Illustration --
    backgroundIllustration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60%', // Takes up top half roughly
        backgroundColor: '#E8E4DD',
        zIndex: 0,
    },
    skyPlaceholder: {
        height: '40%',
        backgroundColor: '#9ED3F2', // Light blue sky color from image
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    buildingPlaceholder: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: 40,
        backgroundColor: '#EAE6DF',
    },
    buildingPillar: {
        width: 60,
        height: '100%',
        backgroundColor: '#D1CCDA', // Column color
    },

    // -- Months Container --
    monthsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100, // Positioned over the building
        zIndex: 10,
        gap: 12,
    },
    monthPill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // Default fallback styles
        backgroundColor: 'white',
    },
    monthPillPast: {
        backgroundColor: '#4E6BF2', // Blue for past
        opacity: 0.8, // Slight blur effect substitute
    },
    monthPillCurrent: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#3137D5', // Blue border
        paddingVertical: 14, // Slightly larger
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    monthPillFuture: {
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        fontSize: 16, // Slightly larger text
    },
    monthTextFuture: {
        color: '#1A1A1A',
    },

    // -- Path & Nest --
    pathContainer: {
        width: '100%',
        marginTop: 80,
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 5,
    },
    nestContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 150,
        height: 150,
        zIndex: 20,
        transform: [{ scale: 0.8 }], // Adjust size
    },

    // -- Bottom Section --
    bottomSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: "center",
        backgroundColor: "#EFF1F4", // Matches the bottom container color in image
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

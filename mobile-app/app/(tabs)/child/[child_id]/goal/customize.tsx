import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface InvestmentSettings {
  monthlySip: number;
  lumpSum: number;
  lumpSumEnabled: boolean;
  stepUpAmount: number;
  stepUpEnabled: boolean;
  investmentPeriod: number;
  expectedReturns: number;
}

export default function CustomizeInvestmentScreen() {
  const [settings, setSettings] = useState<InvestmentSettings>({
    monthlySip: 27500,
    lumpSum: 265000,
    lumpSumEnabled: true,
    stepUpAmount: 4400,
    stepUpEnabled: true,
    investmentPeriod: 10,
    expectedReturns: 12,
  });

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [toggleAnimations, setToggleAnimations] = useState<{
    [key: string]: Animated.Value;
  }>({});

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sipAmountAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for expected value
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateExpectedValue = () => {
    const {
      monthlySip,
      lumpSum,
      lumpSumEnabled,
      stepUpAmount,
      stepUpEnabled,
      investmentPeriod,
      expectedReturns,
    } = settings;

    let totalValue = 0;

    // Calculate SIP value with step-up
    for (let year = 0; year < investmentPeriod; year++) {
      const currentSip = stepUpEnabled
        ? monthlySip + stepUpAmount * year
        : monthlySip;
      const sipValue =
        currentSip *
        12 *
        Math.pow(1 + expectedReturns / 100, investmentPeriod - year - 0.5);
      totalValue += sipValue;
    }

    // Add lump sum if enabled
    if (lumpSumEnabled) {
      totalValue +=
        lumpSum * Math.pow(1 + expectedReturns / 100, investmentPeriod);
    }

    return Math.round(totalValue);
  };

  const updateSetting = (key: keyof InvestmentSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Animate toggle switches
    if (key === "lumpSumEnabled" || key === "stepUpEnabled") {
      const animKey = key === "lumpSumEnabled" ? "lumpSum" : "stepUp";
      const currentAnim =
        toggleAnimations[animKey] || new Animated.Value(value ? 1 : 0);

      Animated.spring(currentAnim, {
        toValue: value ? 1 : 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      setToggleAnimations((prev) => ({
        ...prev,
        [animKey]: currentAnim,
      }));
    }
  };

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSipChange = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate SIP amount change
    Animated.sequence([
      Animated.timing(sipAmountAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(sipAmountAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    updateSetting("monthlySip", value);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to loading screen
    router.push("/child/1/goal/loading");
  };

  const expectedValue = calculateExpectedValue();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Customize Your Investment
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Tailor your plan to reach your goals
            </ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Monthly SIP Amount Card */}
          <Animated.View style={styles.investmentCard}>
            <ThemedText style={styles.cardTitle}>Monthly SIP Amount</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Required to start investing
            </ThemedText>

            <View style={styles.sipAmountContainer}>
              <Animated.Text
                style={[
                  styles.sipAmount,
                  {
                    transform: [{ scale: sipAmountAnim }],
                  },
                ]}
              >
                {formatCurrency(settings.monthlySip)}
              </Animated.Text>
            </View>

            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderTrack}
                onPress={(event) => {
                  const { locationX } = event.nativeEvent;
                  const trackWidth = width - 80; // Account for padding
                  const percentage = Math.max(
                    0,
                    Math.min(1, locationX / trackWidth)
                  );
                  const newValue = Math.round(
                    1000 + percentage * (100000 - 1000)
                  );
                  handleSipChange(newValue);
                }}
                activeOpacity={1}
              >
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${
                        ((settings.monthlySip - 1000) / (100000 - 1000)) * 100
                      }%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${
                        ((settings.monthlySip - 1000) / (100000 - 1000)) * 100
                      }%`,
                    },
                  ]}
                />
              </TouchableOpacity>
              <View style={styles.sliderLabels}>
                <ThemedText style={styles.sliderLabel}>₹1,000</ThemedText>
                <ThemedText style={styles.sliderLabel}>₹1,00,000</ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* Add Lump Sum Card */}
          <Animated.View style={styles.investmentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    settings.lumpSumEnabled && styles.toggleSwitchActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateSetting("lumpSumEnabled", !settings.lumpSumEnabled);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [
                          {
                            translateX: (
                              toggleAnimations.lumpSum ||
                              new Animated.Value(
                                settings.lumpSumEnabled ? 1 : 0
                              )
                            ).interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 20],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </TouchableOpacity>
                <View style={styles.cardTitleContainer}>
                  <ThemedText style={styles.cardTitle}>Add Lump Sum</ThemedText>
                  <ThemedText style={styles.cardSubtitle}>
                    One-time investment
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleSection("lumpSum")}
              >
                <ChevronDown
                  size={20}
                  color="#6B7280"
                  style={{
                    transform: [
                      { rotate: expandedSections.lumpSum ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>
            </View>

            {expandedSections.lumpSum && (
              <Animated.View style={styles.expandedContent}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    Lump Sum Amount
                  </ThemedText>
                  <View style={styles.currencyInputContainer}>
                    <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                    <TextInput
                      style={styles.currencyInput}
                      value={settings.lumpSum.toLocaleString("en-IN")}
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/,/g, "")) || 0;
                        updateSetting("lumpSum", value);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Add Step-Up Plan Card */}
          <Animated.View style={styles.investmentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    settings.stepUpEnabled && styles.toggleSwitchActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateSetting("stepUpEnabled", !settings.stepUpEnabled);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [
                          {
                            translateX: (
                              toggleAnimations.stepUp ||
                              new Animated.Value(settings.stepUpEnabled ? 1 : 0)
                            ).interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 20],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </TouchableOpacity>
                <View style={styles.cardTitleContainer}>
                  <ThemedText style={styles.cardTitle}>
                    Add Step-Up Plan
                  </ThemedText>
                  <ThemedText style={styles.cardSubtitle}>
                    Increase SIP annually
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleSection("stepUp")}
              >
                <ChevronDown
                  size={20}
                  color="#6B7280"
                  style={{
                    transform: [
                      { rotate: expandedSections.stepUp ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>
            </View>

            {expandedSections.stepUp && (
              <Animated.View style={styles.expandedContent}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    Annual Step-Up Amount
                  </ThemedText>
                  <View style={styles.currencyInputContainer}>
                    <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                    <TextInput
                      style={styles.currencyInput}
                      value={settings.stepUpAmount.toLocaleString("en-IN")}
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/,/g, "")) || 0;
                        updateSetting("stepUpAmount", value);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Investment Summary */}
          <LinearGradient
            colors={["#8B5CF6", "#3B82F6"]}
            style={styles.summaryCard}
          >
            <ThemedText style={styles.summaryTitle}>
              INVESTMENT SUMMARY
            </ThemedText>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Monthly SIP</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {formatCurrency(settings.monthlySip)}
              </ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Lump Sum</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {settings.lumpSumEnabled
                  ? formatCurrency(settings.lumpSum)
                  : "₹0"}
              </ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>
                Annual Step-Up
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {settings.stepUpEnabled
                  ? formatCurrency(settings.stepUpAmount)
                  : "₹0"}
              </ThemedText>
            </View>

            <View style={styles.summarySeparator} />

            <View style={styles.expectedValueContainer}>
              <View style={styles.expectedValueLeft}>
                <ThemedText style={styles.expectedValueLabel}>
                  Expected Value ({settings.investmentPeriod} years)
                </ThemedText>
                <ThemedText style={styles.expectedValueSubtext}>
                  @{settings.expectedReturns}% p.a. returns
                </ThemedText>
              </View>
              <Animated.Text
                style={[
                  styles.expectedValueAmount,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {formatCurrency(expectedValue)}
              </Animated.Text>
            </View>
          </LinearGradient>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={["#8B5CF6", "#3B82F6"]}
              style={styles.continueButtonGradient}
            >
              <ThemedText style={styles.continueButtonText}>
                Continue
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  animatedContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  investmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#1F2937",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  expandButton: {
    padding: 8,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  sipAmountContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sipAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sliderContainer: {
    marginTop: 20,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#1F2937",
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateX: -12 }],
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  summarySeparator: {
    height: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.3,
    marginVertical: 16,
  },
  expectedValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  expectedValueLeft: {
    flex: 1,
  },
  expectedValueLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  expectedValueSubtext: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  expectedValueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  continueButton: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

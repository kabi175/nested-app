import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ToggleCardProps {
  title: string;
  subtitle: string;
  initialValue: number;
  onValueChange: (value: number) => void;
  inputLabel: string;
  placeholder?: string;
}

export default function ToggleCard({
  title,
  subtitle,
  initialValue,
  onValueChange,
  inputLabel,
  placeholder = "0",
}: ToggleCardProps) {
  const [isEnabled, setIsEnabled] = useState(initialValue > 0);
  const [value, setValue] = useState(initialValue);
  const toggleAnimation = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;
  const [isExpanded, setIsExpanded] = useState(initialValue > 0);

  useEffect(() => {
    Animated.spring(toggleAnimation, {
      toValue: isEnabled ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isEnabled, toggleAnimation]);

  useEffect(() => {
    // When disabled, set value to 0 and notify parent
    if (!isEnabled) {
      setValue(0);
    } else {
      setValue(initialValue);
    }
    setIsExpanded(isEnabled);
  }, [isEnabled, initialValue]);

  useEffect(() => {
    onValueChange(value);
  }, [value, isEnabled, onValueChange]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEnabled(!isEnabled);
  };

  const handleToggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const handleValueChange = (text: string) => {
    const numericValue = parseInt(text.replace(/,/g, "")) || 0;
    setValue(numericValue);
  };

  return (
    <Animated.View style={styles.investmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              isEnabled && styles.toggleSwitchActive,
            ]}
            onPress={handleToggle}
          >
            <Animated.View
              style={[
                styles.toggleThumb,
                {
                  transform: [
                    {
                      translateX: toggleAnimation.interpolate({
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
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleToggleExpanded}
        >
          <ChevronDown
            size={20}
            color="#6B7280"
            style={{
              transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <Animated.View style={styles.expandedContent}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>{inputLabel}</ThemedText>
            <View style={styles.currencyInputContainer}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={styles.currencyInput}
                value={value.toLocaleString("en-IN")}
                onChangeText={handleValueChange}
                keyboardType="numeric"
                placeholder={placeholder}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});

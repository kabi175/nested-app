import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface SaveGoalButtonProps {
  onPress: () => void;
  isLoading: boolean;
}

export function SaveGoalButton({ onPress, isLoading }: SaveGoalButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate save button
    const saveButtonScale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(saveButtonScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.saveButton,
        isLoading && styles.saveButtonDisabled,
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <View style={styles.saveButtonLoading}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <ThemedText style={[styles.saveButtonText, { marginLeft: 8 }]}>
            Saving...
          </ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.saveButtonText}>Next</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  saveButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
});


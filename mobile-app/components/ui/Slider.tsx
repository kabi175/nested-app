import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
}

export default function Slider({
  min,
  max,
  value,
  onValueChange,
  formatValue,
  minLabel,
  maxLabel,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const trackWidth = width - 80; // Account for padding
    const pressPercentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const newValue = Math.round(min + pressPercentage * (max - min));
    onValueChange(newValue);
  };

  const defaultFormatValue = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const defaultMinLabel = formatValue
    ? formatValue(min)
    : defaultFormatValue(min);
  const defaultMaxLabel = formatValue
    ? formatValue(max)
    : defaultFormatValue(max);

  return (
    <View style={styles.sliderContainer}>
      <TouchableOpacity
        style={styles.sliderTrack}
        onPress={handleSliderPress}
        activeOpacity={1}
      >
        <View
          style={[
            styles.sliderFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            {
              left: `${percentage}%`,
            },
          ]}
        />
      </TouchableOpacity>
      <View style={styles.sliderLabels}>
        <ThemedText style={styles.sliderLabel}>
          {minLabel || defaultMinLabel}
        </ThemedText>
        <ThemedText style={styles.sliderLabel}>
          {maxLabel || defaultMaxLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

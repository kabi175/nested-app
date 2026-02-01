import { ThemedText } from "@/components/ThemedText";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

export default function Slider({
  min,
  max,
  value,
  onValueChange,
  formatValue,
  minLabel,
  maxLabel,
  step = 500,
}: SliderProps) {
  const theme = useTheme();

  const handleValueChange = (newValue: number) => {
    // Apply step rounding if step is provided
    if (step > 0) {
      const normalized = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, normalized));
      onValueChange(clampedValue);
    } else {
      onValueChange(newValue);
    }
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
      <RNSlider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={handleValueChange}
        step={step > 0 ? step : undefined}
        minimumTrackTintColor={theme["color-primary-500"]}
        maximumTrackTintColor={theme["color-basic-300"]}
        thumbTintColor={theme["color-primary-500"]}
      />
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
  slider: {
    width: "100%",
    height: 40,
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

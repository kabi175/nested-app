import NativeSlider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SliderProps {
  variant?: 'default' | 'minimal';
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Slider({
  variant = 'default',
  label = 'MONTHLY SIP',
  min = 3000,
  max = 11000,
  step = 10,
  initialValue = 5840,
  onValueChange,
}: SliderProps) {
  const [value, setValue] = useState(initialValue);
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const formatMinMax = (num: number) => {
    if (num >= 1000) {
      return `₹${Math.floor(num / 1000)}k/mo`;
    }
    return `₹${num}/mo`;
  };

  // Safe percentage calculation
  const percentage = max - min > 0 ? (value - min) / (max - min) : 0;

  // Custom thumb width is 32. We want center of thumb to align with the percentage.
  const thumbRadius = 16;
  const thumbPosition = percentage * sliderWidth;

  const isMinimal = variant === 'minimal';

  const content = (
    <>
      {!isMinimal && <Text style={styles.label}>{label}</Text>}
      {!isMinimal && <Text style={styles.value}>₹{formatNumber(value)}</Text>}

      <View
        style={styles.sliderWrapper}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      >
        {/* Custom Track - Background (White) */}
        <View style={styles.trackBackground} />

        {/* Custom Track - Active (Blue with Gradient) */}
        <LinearGradient
          colors={['#2848F1', '#6F85F5']}
          locations={[0, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.trackActive, { width: `${percentage * 100}%` }]}
        />

        {/* Custom Thumb - perfectly centered over the current position */}
        {sliderWidth > 0 && (
          <View
            style={[
              styles.customThumb,
              { transform: [{ translateX: thumbPosition - thumbRadius }] },
            ]}
            pointerEvents="none"
          >
            <View style={styles.thumbInner} />
          </View>
        )}

        {/* Invisible Native Slider for interaction and accessibility */}
        <NativeSlider
          style={StyleSheet.absoluteFillObject}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />
      </View>

      <View style={styles.minMaxContainer}>
        <Text style={[styles.minMaxText, { textAlign: 'left', flex: 1 }]}>{formatMinMax(min)}</Text>
        {isMinimal && (
          <Text style={[styles.currentText, { textAlign: 'center', flex: 1 }]}>
            {formatMinMax(value)}
          </Text>
        )}
        <Text style={[styles.minMaxText, { textAlign: 'right', flex: 1 }]}>{formatMinMax(max)}</Text>
      </View>
    </>
  );

  if (isMinimal) {
    return <View style={styles.minimalContainer}>{content}</View>;
  }

  return (
    <View style={styles.outerBorder}>
      <View style={styles.container}>
        {content}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerBorder: {
    backgroundColor: '#3137D5', // Matches the thin blue stroke
    borderRadius: 24,
    padding: 1.5,
    width: '100%',
  },
  container: {
    backgroundColor: '#F4F5F6',
    borderRadius: 23, // slightly less than outer to fit perfectly
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: '100%',
  },
  label: {
    color: '#6E6F7A',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    color: '#1D1E20',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  sliderWrapper: {
    height: 32,
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  trackActive: {
    position: 'absolute',
    left: 0,
    height: 10,
    backgroundColor: '#4F55EE',
    borderRadius: 5,
  },
  customThumb: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3137D5',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minMaxText: {
    color: '#A0A0A5',
    fontSize: 12,
    fontWeight: '500',
  },
  minimalContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  currentText: {
    color: '#1D1E20',
    fontSize: 13,
    fontWeight: '600',
  },
});

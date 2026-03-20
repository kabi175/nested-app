import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StepUpInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const StepUpInput: React.FC<StepUpInputProps> = ({
  value: controlledValue,
  onChange,
  min = 0,
  max = 50,
  step = 5,
}) => {
  const [internalValue, setInternalValue] = useState(10);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const increment = () => {
    const next = Math.min(value + step, max);
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const decrement = () => {
    const next = Math.max(value - step, min);
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.labelContainer}>
        <Text style={styles.title}>STEP-UP</Text>
        <Text style={styles.subtitle}>Increase my SIP a little every year</Text>
      </View>
      <View style={styles.stepper}>
        <Text style={styles.stepperValue}>{value}%</Text>
        <View style={styles.arrows}>
          <Pressable onPress={increment} hitSlop={8} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>▲</Text>
          </Pressable>
          <Pressable onPress={decrement} hitSlop={8} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>▼</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F4F5F6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1E20',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6E6F7A',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E6EA',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1E20',
    minWidth: 36,
    textAlign: 'center',
  },
  arrows: {
    gap: 0,
  },
  arrowBtn: {
    paddingVertical: 1,
  },
  arrowText: {
    fontSize: 10,
    color: '#6E6F7A',
    lineHeight: 13,
  },
});

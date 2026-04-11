import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PlanSummary {
  label: string;
  amount: number;
}

interface PlanProjectionProps {
  year?: number;
  plans?: PlanSummary[];
  maxAmount?: number;
}

const DEFAULT_PLANS = [
  { label: 'NESTED', amount: 51 },
  { label: 'FD / RD', amount: 24 },
  { label: 'No plan', amount: 0 },
];

export default function PlanProjection({
  year = 2037,
  plans = DEFAULT_PLANS,
  maxAmount = 55, // Using 55 so that 51 gives ~93% fill, matching the design
}: PlanProjectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>WHAT YOU&apos;D REACH BY {year}</Text>
      <View style={styles.rows}>
        {plans.map((plan, index) => {
          // Calculate percentage width, ensuring a minimum for the visual "cap"
          const percentage = Math.max((plan.amount / maxAmount) * 100, 4);

          return (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{plan.label}</Text>
              
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={['#BBC8FF', '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.barFill, { width: `${percentage}%` }]}
                />
              </View>
              
              <Text style={styles.value}>
                ₹{plan.amount}{plan.amount > 0 ? 'L' : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8F9',
    borderRadius: 36,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8A8A8E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  rows: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 80, 
    fontSize: 16,
    fontWeight: '600',
    color: '#8A8A8E',
  },
  barTrack: {
    flex: 1,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    // Simulate inset shadow with subtle border
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  value: {
    width: 56,
    fontSize: 16,
    fontWeight: '500',
    color: '#7A7A7E',
    textAlign: 'right',
  },
});

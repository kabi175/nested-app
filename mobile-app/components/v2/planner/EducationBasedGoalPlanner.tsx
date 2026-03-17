import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import BackButton from '../BackButton';
import Button from '../Button';
import Slider from '../Slider';
import { EducationGoalCard } from './EducationGoalCard';
import { LumpSumInput } from './LumpSumInput';
import PlanProjection from './PlanProjection';
import { StepUpInput } from './StepUpInput';

const MAX_SIP_AMOUNT = 1_00_000;

type PlanMode = 'ideal' | 'custom';

interface EducationBasedGoalPlannerProps {
  childName?: string;
  goalYear?: number;
  goalAmount?: number;
  collegeType?: string;
  idealSipAmount?: number;
  minSip?: number;
  sipStep?: number;
  error?: string;
  onBack?: () => void;
  onBegin?: (params: {
    mode: PlanMode;
    sipAmount: number;
    lumpSum?: number;
    stepUp?: number;
  }) => void;
}

export default function EducationBasedGoalPlanner({
  childName = 'Aanya',
  goalYear = 2037,
  goalAmount = 4860000,
  collegeType = 'Top College (IIT/NIT/Private)',
  idealSipAmount = 6200,
  minSip = 500,
  sipStep = 100,
  error,
  onBack,
  onBegin,
}: EducationBasedGoalPlannerProps) {
  const yearsFromNow = goalYear - new Date().getFullYear();
  const [mode, setMode] = useState<PlanMode>('ideal');
  const [sipAmount, setSipAmount] = useState(idealSipAmount);

  const normalizedSipAmount = Math.max(minSip, Math.round(sipAmount / sipStep) * sipStep);

  const handleSipAmountChange = (value: number) => {
    setSipAmount(Math.round(value / sipStep) * sipStep);
  };
  const [lumpSumEnabled, setLumpSumEnabled] = useState(false);
  const [lumpSumAmount, setLumpSumAmount] = useState('');
  const [stepUp, setStepUp] = useState(10);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (mode === 'custom') {
      subtitleFade.setValue(0);
      subtitleSlide.setValue(8);
      Animated.parallel([
        Animated.timing(subtitleFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(subtitleSlide, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(subtitleFade, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [mode]);

  const formattedSip = normalizedSipAmount.toLocaleString('en-IN');
  const totalInvestedLakhs = ((normalizedSipAmount * 12 * yearsFromNow) / 100000).toFixed(1);

  const handleBegin = () => {
    onBegin?.({
      mode,
      sipAmount: normalizedSipAmount,
      lumpSum: lumpSumEnabled ? parseFloat(lumpSumAmount) || 0 : undefined,
      stepUp: mode === 'custom' ? stepUp : undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <BackButton onPress={onBack ?? (() => { })} />

        {/* Title + subtitle */}
        <Animated.View style={[styles.titleBlock, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>
            Here's what we're planning{'\n'}for{' '}
            <Text style={styles.titleBold}>{childName}</Text>
          </Text>
          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: subtitleFade, transform: [{ translateY: subtitleSlide }] },
            ]}
          >
            Taking into account the possible inflation,{'\n'}
            and based on the child's age & dream.
          </Animated.Text>
        </Animated.View>

        {/* Goal card */}
        <View style={styles.goalCardWrapper}>
          <EducationGoalCard
            year={goalYear}
            amount={goalAmount}
            collegeType={collegeType}
            yearsFromNow={yearsFromNow}
          />

        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MONTHLY SIP</Text>
            <Text style={styles.statValue}>₹{formattedSip}</Text>
            <Text style={styles.statSub}>{mode === 'ideal' ? 'Ideal plan' : 'Custom plan'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL INVESTED</Text>
            <Text style={styles.statValue}>₹{totalInvestedLakhs}L</Text>
            <Text style={styles.statSub}>over {yearsFromNow} years</Text>
          </View>
        </View>

        {/* Ideal / Custom toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, mode === 'ideal' && styles.toggleBtnActive]}
            onPress={() => {
              setSipAmount(idealSipAmount);
              setMode('ideal');
            }}
          >
            <Text style={[styles.toggleTitle, mode === 'ideal' && styles.toggleTitleActive]}>
              Ideal
            </Text>
            <Text style={[styles.toggleSub, mode === 'ideal' && styles.toggleSubActive]}>
              ₹{idealSipAmount.toLocaleString('en-IN')}/mo
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, mode === 'custom' && styles.toggleBtnActive]}
            onPress={() => setMode('custom')}
          >
            <Text style={[styles.toggleTitle, mode === 'custom' && styles.toggleTitleActive]}>
              Custom
            </Text>
            <Text style={[styles.toggleSub, mode === 'custom' && styles.toggleSubActive]}>
              {mode === 'custom' ? '(set yours)' : 'set yours'}
            </Text>
          </Pressable>
        </View>

        {/* Custom controls */}
        {mode === 'custom' && (
          <View style={styles.customControls}>
            <Slider
              variant="minimal"
              min={minSip}
              max={MAX_SIP_AMOUNT}
              step={sipStep}
              initialValue={normalizedSipAmount}
              onValueChange={handleSipAmountChange}
            />
            <LumpSumInput
              enabled={lumpSumEnabled}
              onToggle={setLumpSumEnabled}
              amount={lumpSumAmount}
              onAmountChange={setLumpSumAmount}
            />
            <StepUpInput value={stepUp} onChange={setStepUp} />
          </View>
        )}

        {/* Projection */}
        <PlanProjection year={goalYear} />

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {mode === 'ideal'
              ? `We adjust the nest automatically as ${childName} grows, shifting from high growth to stability closer to college.`
              : `Nested auto-rebalances your portfolio every year as '${childName.charAt(0).toLowerCase()}' grows, shifting from high growth to stability closer to college.`}
          </Text>
        </View>

        {/* CTA */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Button title="Let's begin  →" onPress={handleBegin} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    color: '#1D1E20',
    textAlign: 'center',
    lineHeight: 34,
  },
  titleBold: {
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6E6F7A',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalCardWrapper: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8E',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1E20',
  },
  statSub: {
    fontSize: 13,
    color: '#8A8A8E',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#3137D5',
  },
  toggleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1E20',
  },
  toggleTitleActive: {
    color: '#FFFFFF',
  },
  toggleSub: {
    fontSize: 13,
    color: '#8A8A8E',
  },
  toggleSubActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  customControls: {
    gap: 12,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  disclaimer: {
    borderWidth: 1.5,
    borderColor: '#D4D4D4',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
  },
  disclaimerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6E6F7A',
    textAlign: 'center',
    lineHeight: 20,
  },
});

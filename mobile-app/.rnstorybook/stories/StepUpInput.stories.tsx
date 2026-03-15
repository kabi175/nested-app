import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StepUpInput } from '../../components/v2/planner/StepUpInput';

export default {
  title: 'v2/planner/StepUpInput',
  component: StepUpInput,
};

export const Default = () => (
  <View style={styles.container}>
    <StepUpInput />
  </View>
);

export const ZeroPercent = () => (
  <View style={styles.container}>
    <StepUpInput value={0} />
  </View>
);

export const HighStepUp = () => (
  <View style={styles.container}>
    <StepUpInput value={25} />
  </View>
);

export const Interactive = () => (
  <View style={styles.container}>
    <StepUpInput />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LumpSumInput } from '../../components/v2/planner/LumpSumInput';

export default {
  title: 'v2/planner/LumpSumInput',
  component: LumpSumInput,
};

export const ToggleOff = () => (
  <View style={styles.container}>
    <LumpSumInput enabled={false} />
  </View>
);

export const ToggleOn = () => (
  <View style={styles.container}>
    <LumpSumInput enabled={true} />
  </View>
);

export const ToggleOnWithAmount = () => (
  <View style={styles.container}>
    <LumpSumInput enabled={true} amount="" />
  </View>
);

export const WithError = () => (
  <View style={styles.container}>
    <LumpSumInput enabled={true} amount="" error="Please enter a valid amount" touched={true} />
  </View>
);

export const Interactive = () => (
  <View style={styles.container}>
    <LumpSumInput />
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

import React from 'react';
import { StyleSheet, View } from 'react-native';
import PlanProjection from '../../components/v2/planner/PlanProjection';

export default {
  title: 'v2/planner/PlanProjection',
  component: PlanProjection,
};

export const Default = () => {
  return (
    <View style={styles.container}>
      <PlanProjection />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

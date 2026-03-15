import React from 'react';
import { StyleSheet, View } from 'react-native';
import EducationBasedGoalPlanner from '../../components/v2/planner/EducationBasedGoalPlanner';

export default {
  title: 'v2/planner/EducationBasedGoalPlanner',
  component: EducationBasedGoalPlanner,
};

export const IdealMode = () => (
  <View style={styles.container}>
    <EducationBasedGoalPlanner />
  </View>
);

export const CustomChildName = () => (
  <View style={styles.container}>
    <EducationBasedGoalPlanner
      childName="Rohan"
      goalYear={2035}
      goalAmount="₹32.4L"
      collegeType="Top College (IIT/NIT/Private)"
      yearsFromNow={9}
      idealSipAmount={4800}
    />
  </View>
);

export const LongTimeHorizon = () => (
  <View style={styles.container}>
    <EducationBasedGoalPlanner
      childName="Meera"
      goalYear={2042}
      goalAmount="₹1.2Cr"
      collegeType="International University"
      yearsFromNow={18}
      idealSipAmount={9500}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

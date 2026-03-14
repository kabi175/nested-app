import { StyleSheet, View } from 'react-native';
import { EducationGoalCard } from '../../components/v2/planner/EducationGoalCard';

export default {
  title: 'v2/planner/EducationGoalCard',
  component: EducationGoalCard,
};

export const Default = () => {
  return (
    <View style={styles.container}>
      <EducationGoalCard />
    </View>
  );
};

export const CustomAmount = () => {
  return (
    <View style={styles.container}>
      <EducationGoalCard
        year={2032}
        amount="₹75.2L"
        collegeType="IIM / Top MBA"
        yearsFromNow={7}
      />
    </View>
  );
};

export const Abroad = () => {
  return (
    <View style={styles.container}>
      <EducationGoalCard
        year={2040}
        amount="₹1.2Cr"
        collegeType="International University"
        yearsFromNow={15}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
});

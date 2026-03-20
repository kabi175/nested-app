import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '../../components/v2/Slider';

export default {
  title: 'v2/Slider',
  component: Slider,
};

export const Default = () => {
  const [value, setValue] = useState(5840);
  return (
    <View style={styles.container}>
      <Slider
        min={3000}
        max={11000}
        initialValue={5840}
        step={10}
        onValueChange={setValue}
      />
    </View>
  );
};

export const Minimal = () => {
  const [value, setValue] = useState(6000);
  return (
    <View style={styles.container}>
      <Slider
        variant="minimal"
        min={3000}
        max={11000}
        initialValue={6000}
        step={10}
        onValueChange={setValue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

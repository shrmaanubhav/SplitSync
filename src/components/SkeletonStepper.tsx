import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonStepperProps {
  style?: any;
}

const SkeletonStepper: React.FC<SkeletonStepperProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader
        width={30}
        height={30}
        borderRadius={15}
        style={styles.button}
      />
      <SkeletonLoader height={16} width={30} style={styles.value} />
      <SkeletonLoader
        width={30}
        height={30}
        borderRadius={15}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    // Button styling
  },
  value: {
    marginHorizontal: 15,
  },
});

export default SkeletonStepper;

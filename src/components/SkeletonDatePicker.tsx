import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonDatePickerProps {
  style?: any;
}

const SkeletonDatePicker: React.FC<SkeletonDatePickerProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={16} width="30%" style={styles.label} />
      <SkeletonLoader height={50} borderRadius={8} style={styles.input} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    // Input styling
  },
});

export default SkeletonDatePicker;

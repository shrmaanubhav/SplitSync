import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonCheckboxProps {
  style?: any;
}

const SkeletonCheckbox: React.FC<SkeletonCheckboxProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader
        width={20}
        height={20}
        borderRadius={4}
        style={styles.checkbox}
      />
      <SkeletonLoader height={16} width="60%" style={styles.label} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  label: {
    // Label styling
  },
});

export default SkeletonCheckbox;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonRadioButtonProps {
  style?: any;
}

const SkeletonRadioButton: React.FC<SkeletonRadioButtonProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader
        width={20}
        height={20}
        borderRadius={10}
        style={styles.radio}
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
  radio: {
    marginRight: 10,
  },
  label: {
    // Label styling
  },
});

export default SkeletonRadioButton;

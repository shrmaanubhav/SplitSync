import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonSliderProps {
  style?: any;
}

const SkeletonSlider: React.FC<SkeletonSliderProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={16} width="40%" />
        <SkeletonLoader height={16} width="20%" />
      </View>
      <SkeletonLoader height={40} style={styles.slider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default SkeletonSlider;

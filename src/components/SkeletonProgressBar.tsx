import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonProgressBarProps {
  style?: any;
}

const SkeletonProgressBar: React.FC<SkeletonProgressBarProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={14} width="40%" style={styles.label} />
      <SkeletonLoader height={10} borderRadius={5} style={styles.progress} />
      <SkeletonLoader height={12} width="20%" style={styles.progressText} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 5,
  },
  progress: {
    // Progress styling
  },
  progressText: {
    marginTop: 5,
    textAlign: 'right',
  },
});

export default SkeletonProgressBar;

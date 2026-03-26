import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonProgressCircleProps {
  size?: number;
  style?: any;
}

const SkeletonProgressCircle: React.FC<SkeletonProgressCircleProps> = ({
  size = 100,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader
        width={size}
        height={size}
        borderRadius={size / 2}
        style={styles.circle}
      />
      <SkeletonLoader
        height={size / 4}
        width={size / 4}
        style={styles.percentage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    // Circle styling
  },
  percentage: {
    position: 'absolute',
    fontWeight: 'bold',
  },
});

export default SkeletonProgressCircle;

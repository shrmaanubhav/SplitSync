import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonLinearGradientProps {
  style?: any;
}

const SkeletonLinearGradient: React.FC<SkeletonLinearGradientProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={100} style={styles.gradient} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styling
  },
  gradient: {
    // Gradient styling
  },
});

export default SkeletonLinearGradient;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonBlurViewProps {
  style?: any;
}

const SkeletonBlurView: React.FC<SkeletonBlurViewProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={100} style={styles.blur} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styling
  },
  blur: {
    // Blur styling
  },
});

export default SkeletonBlurView;

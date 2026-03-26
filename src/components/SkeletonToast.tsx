import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonToastProps {
  style?: any;
}

const SkeletonToast: React.FC<SkeletonToastProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={16} width="80%" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 15,
    zIndex: 1000,
  },
});

export default SkeletonToast;

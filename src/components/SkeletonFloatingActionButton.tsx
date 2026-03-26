import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { getFloatingButtonPosition } from '../utils/layout.utils';

interface SkeletonFloatingActionButtonProps {
  style?: any;
  bottomOffset?: number; // Additional offset for special cases
}

const SkeletonFloatingActionButton: React.FC<
  SkeletonFloatingActionButtonProps
> = ({ style, bottomOffset = 0 }) => {
  return (
    <SkeletonLoader
      width={56}
      height={56}
      borderRadius={28}
      style={[
        styles.container,
        { bottom: getFloatingButtonPosition(bottomOffset) },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
  },
});

export default SkeletonFloatingActionButton;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonButtonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  width = '100%',
  height = 40,
  style,
}) => {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={8}
      style={style}
    />
  );
};

export default SkeletonButton;

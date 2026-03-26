import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonBadgeProps {
  style?: any;
}

const SkeletonBadge: React.FC<SkeletonBadgeProps> = ({ style }) => {
  return (
    <SkeletonLoader width={20} height={20} borderRadius={10} style={style} />
  );
};

export default SkeletonBadge;

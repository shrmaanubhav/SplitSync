import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonDividerProps {
  style?: any;
}

const SkeletonDivider: React.FC<SkeletonDividerProps> = ({ style }) => {
  return <SkeletonLoader height={1} width="100%" style={style} />;
};

export default SkeletonDivider;

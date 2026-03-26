import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonStatusBarProps {
  style?: any;
}

const SkeletonStatusBar: React.FC<SkeletonStatusBarProps> = ({ style }) => {
  return <SkeletonLoader height={20} width="100%" style={style} />;
};

export default SkeletonStatusBar;

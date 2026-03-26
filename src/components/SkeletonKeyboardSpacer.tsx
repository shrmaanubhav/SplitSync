import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonKeyboardSpacerProps {
  style?: any;
}

const SkeletonKeyboardSpacer: React.FC<SkeletonKeyboardSpacerProps> = ({
  style,
}) => {
  return <SkeletonLoader height={20} width="100%" style={style} />;
};

export default SkeletonKeyboardSpacer;

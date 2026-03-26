import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonAvatarProps {
  size?: number;
  style?: any;
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  style,
}) => {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

export default SkeletonAvatar;

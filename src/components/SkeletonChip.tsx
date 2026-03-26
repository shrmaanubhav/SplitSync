import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonChipProps {
  style?: any;
}

const SkeletonChip: React.FC<SkeletonChipProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={14} width={80} borderRadius={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 4,
  },
});

export default SkeletonChip;

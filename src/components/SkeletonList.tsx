import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonCard from './SkeletonCard';

interface SkeletonListProps {
  count?: number;
  style?: any;
}

const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5, style }) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SkeletonList;

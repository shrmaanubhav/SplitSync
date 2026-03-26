import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonCard from './SkeletonCard';

interface SkeletonGridProps {
  count?: number;
  columns?: number;
  style?: any;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  columns = 2,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.item, { width: `${100 / columns}%` }]}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    padding: 5,
  },
});

export default SkeletonGrid;

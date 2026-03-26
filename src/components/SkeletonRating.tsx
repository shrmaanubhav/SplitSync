import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonRatingProps {
  stars?: number;
  style?: any;
}

const SkeletonRating: React.FC<SkeletonRatingProps> = ({
  stars = 5,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: stars }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={24}
          height={24}
          style={styles.star}
        />
      ))}
      <SkeletonLoader height={16} width={30} style={styles.rating} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  rating: {
    marginLeft: 10,
  },
});

export default SkeletonRating;

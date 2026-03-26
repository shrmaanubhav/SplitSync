import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonPullToRefreshProps {
  style?: any;
}

const SkeletonPullToRefresh: React.FC<SkeletonPullToRefreshProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader
        width={30}
        height={30}
        borderRadius={15}
        style={styles.indicator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicator: {
    // Indicator styling
  },
});

export default SkeletonPullToRefresh;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonEmptyStateProps {
  style?: any;
}

const SkeletonEmptyState: React.FC<SkeletonEmptyStateProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader width={48} height={48} style={styles.icon} />
      <SkeletonLoader height={24} width="60%" style={styles.title} />
      <SkeletonLoader height={16} width="80%" style={styles.description} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});

export default SkeletonEmptyState;

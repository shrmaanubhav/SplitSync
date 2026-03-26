import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonGroupItemProps {
  style?: any;
}

const SkeletonGroupItem: React.FC<SkeletonGroupItemProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={20} width="60%" />
        <SkeletonLoader height={14} width="20%" />
      </View>
      <SkeletonLoader height={16} width="80%" style={styles.description} />
      <View style={styles.footer}>
        <SkeletonLoader height={16} width="40%" />
        <SkeletonLoader height={16} width="40%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  description: {
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SkeletonGroupItem;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonExpenseItemProps {
  style?: any;
}

const SkeletonExpenseItem: React.FC<SkeletonExpenseItemProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={20} width="60%" />
        <SkeletonLoader height={20} width="20%" />
      </View>
      <View style={styles.footer}>
        <SkeletonLoader height={16} width="40%" />
        <SkeletonLoader height={16} width="30%" />
      </View>
      <SkeletonLoader height={16} width="50%" style={styles.group} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  group: {
    marginTop: 5,
  },
});

export default SkeletonExpenseItem;

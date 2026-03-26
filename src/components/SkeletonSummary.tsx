import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonSummaryProps {
  style?: any;
}

const SkeletonSummary: React.FC<SkeletonSummaryProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={20} width="60%" style={styles.title} />
      <SkeletonLoader height={30} style={styles.amount} />
      <SkeletonLoader height={16} width="80%" style={styles.description} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    marginBottom: 10,
  },
  amount: {
    marginBottom: 10,
  },
  description: {
    marginTop: 10,
  },
});

export default SkeletonSummary;

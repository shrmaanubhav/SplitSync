import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonCardProps {
  style?: any;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={120} style={styles.image} />
      <View style={styles.content}>
        <SkeletonLoader height={20} style={styles.title} />
        <SkeletonLoader height={16} style={styles.description} />
        <SkeletonLoader height={16} width="60%" style={styles.footer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  image: {
    borderRadius: 0,
  },
  content: {
    padding: 15,
  },
  title: {
    marginBottom: 10,
  },
  description: {
    marginBottom: 10,
  },
  footer: {
    marginTop: 10,
  },
});

export default SkeletonCard;

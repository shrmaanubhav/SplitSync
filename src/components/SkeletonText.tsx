import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonTextProps {
  lines?: number;
  style?: any;
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1, style }) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={16}
          style={[styles.line, index < lines - 1 && styles.marginBottom]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
  line: {
    borderRadius: 4,
  },
  marginBottom: {
    marginBottom: 8,
  },
});

export default SkeletonText;

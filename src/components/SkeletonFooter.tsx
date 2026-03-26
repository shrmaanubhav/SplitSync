import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonFooterProps {
  style?: any;
}

const SkeletonFooter: React.FC<SkeletonFooterProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={20} width="30%" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
});

export default SkeletonFooter;

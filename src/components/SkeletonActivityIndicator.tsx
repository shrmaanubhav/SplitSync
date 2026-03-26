import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonActivityIndicatorProps {
  style?: any;
}

const SkeletonActivityIndicator: React.FC<SkeletonActivityIndicatorProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
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
});

export default SkeletonActivityIndicator;

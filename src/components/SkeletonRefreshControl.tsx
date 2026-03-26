import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonRefreshControlProps {
  style?: any;
}

const SkeletonRefreshControl: React.FC<SkeletonRefreshControlProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader width={30} height={30} borderRadius={15} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Refresh control styling
  },
});

export default SkeletonRefreshControl;

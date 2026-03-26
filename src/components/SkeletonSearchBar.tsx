import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonSearchBarProps {
  style?: any;
}

const SkeletonSearchBar: React.FC<SkeletonSearchBarProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={50} borderRadius={8} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
});

export default SkeletonSearchBar;

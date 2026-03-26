import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonNavigationHeaderProps {
  style?: any;
}

const SkeletonNavigationHeader: React.FC<SkeletonNavigationHeaderProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={20} width="20%" style={styles.backButton} />
      <SkeletonLoader height={20} width="40%" />
      <SkeletonLoader height={20} width="20%" style={styles.rightComponent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    // Back button styling
  },
  rightComponent: {
    // Right component styling
  },
});

export default SkeletonNavigationHeader;

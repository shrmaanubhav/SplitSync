import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonTabBarProps {
  tabs?: number;
  style?: any;
}

const SkeletonTabBar: React.FC<SkeletonTabBarProps> = ({ tabs = 4, style }) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: tabs }).map((_, index) => (
        <View key={index} style={styles.tab}>
          <SkeletonLoader height={20} width="60%" />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
});

export default SkeletonTabBar;

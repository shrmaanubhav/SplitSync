import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonSafeAreaViewProps {
  style?: any;
}

const SkeletonSafeAreaView: React.FC<SkeletonSafeAreaViewProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader height={20} width="100%" style={styles.statusBar} />
      <View style={styles.content}>
        <SkeletonLoader height={16} width="60%" style={styles.title} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    // Status bar styling
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    // Title styling
  },
});

export default SkeletonSafeAreaView;

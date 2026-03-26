import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonDrawerProps {
  items?: number;
  style?: any;
}

const SkeletonDrawer: React.FC<SkeletonDrawerProps> = ({
  items = 5,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={24} width="40%" />
        <SkeletonLoader height={24} width="10%" style={styles.closeButton} />
      </View>

      {Array.from({ length: items }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={16}
          width="80%"
          style={styles.item}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    // Close button styling
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
});

export default SkeletonDrawer;

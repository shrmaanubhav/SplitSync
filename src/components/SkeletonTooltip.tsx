import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonTooltipProps {
  style?: any;
}

const SkeletonTooltip: React.FC<SkeletonTooltipProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonLoader width={20} height={20} style={styles.trigger} />
      <View style={styles.tooltip}>
        <SkeletonLoader height={12} width={100} />
        <View style={styles.arrow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    // Trigger area for the tooltip
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    zIndex: 1000,
  },
  arrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -5 }],
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
});

export default SkeletonTooltip;

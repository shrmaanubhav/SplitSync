import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonModalProps {
  style?: any;
}

const SkeletonModal: React.FC<SkeletonModalProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <SkeletonLoader height={18} width="40%" />
        <SkeletonLoader height={24} width="10%" style={styles.closeButton} />
      </View>
      <View style={styles.content}>
        <SkeletonLoader height={16} width="80%" style={styles.text} />
        <SkeletonLoader height={16} width="60%" style={styles.text} />
        <SkeletonLoader height={16} width="70%" style={styles.text} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  text: {
    marginBottom: 10,
  },
});

export default SkeletonModal;

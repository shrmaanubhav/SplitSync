import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonNotificationProps {
  style?: any;
}

const SkeletonNotification: React.FC<SkeletonNotificationProps> = ({
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <SkeletonLoader height={16} width="60%" style={styles.title} />
        <SkeletonLoader height={14} width="80%" style={styles.message} />
      </View>
      <SkeletonLoader height={12} width="20%" style={styles.time} />
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 5,
  },
  message: {
    // Message styling
  },
  time: {
    marginLeft: 10,
  },
});

export default SkeletonNotification;

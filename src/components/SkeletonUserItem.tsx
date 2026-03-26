import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import SkeletonAvatar from './SkeletonAvatar';

interface SkeletonUserItemProps {
  style?: any;
}

const SkeletonUserItem: React.FC<SkeletonUserItemProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <SkeletonAvatar size={50} style={styles.avatar} />
      <View style={styles.info}>
        <SkeletonLoader height={16} width="60%" style={styles.name} />
        <SkeletonLoader height={14} width="80%" style={styles.email} />
      </View>
      <SkeletonLoader height={20} width={60} style={styles.badge} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  avatar: {
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: 5,
  },
  email: {
    // Email styling
  },
  badge: {
    borderRadius: 12,
  },
});

export default SkeletonUserItem;

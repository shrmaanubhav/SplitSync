import React, { useRef } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  style?: any;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
        {children}
      </RefreshControl>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PullToRefresh;

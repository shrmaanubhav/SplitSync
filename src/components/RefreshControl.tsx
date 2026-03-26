import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';

interface RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  colors?: string[];
  tintColor?: string;
  title?: string;
  titleColor?: string;
}

const RefreshControl: React.FC<RefreshControlProps> = ({
  refreshing,
  onRefresh,
  colors = ['#007AFF'],
  tintColor = '#007AFF',
  title,
  titleColor,
}) => {
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={colors}
      tintColor={tintColor}
      title={title}
      titleColor={titleColor}
    />
  );
};

export default RefreshControl;

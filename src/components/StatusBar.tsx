import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';

interface StatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  hidden?: boolean;
  translucent?: boolean;
  style?: any;
}

const StatusBar: React.FC<StatusBarProps> = ({
  backgroundColor = '#FFFFFF',
  barStyle = 'dark-content',
  hidden = false,
  translucent = false,
  style,
}) => {
  return (
    <RNStatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      hidden={hidden}
      translucent={translucent}
    />
  );
};

export default StatusBar;

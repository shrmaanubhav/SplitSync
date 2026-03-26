import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { getCurrentTheme } from '../services/theme.service';
import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM_MARGIN,
} from './FloatingTabBar';

// Calculate the total bottom padding needed for the floating tab bar
const FLOATING_TAB_BAR_TOTAL_HEIGHT = FLOATING_TAB_BAR_HEIGHT;
const DEFAULT_BOTTOM_PADDING =
  FLOATING_TAB_BAR_TOTAL_HEIGHT + FLOATING_TAB_BAR_BOTTOM_MARGIN + 20;

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: any;
  contentContainerStyle?: any;
  bottomPadding?: number; // allows override if needed
}

const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  bottomPadding,
}) => {
  const theme = getCurrentTheme();
  const paddingBottom = bottomPadding ?? DEFAULT_BOTTOM_PADDING;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }, style]}
        contentContainerStyle={[{ paddingBottom }, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingBottom },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Screen;

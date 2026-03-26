import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM_MARGIN,
} from '../components/FloatingTabBar';

// Calculate the safe area above the floating tab bar for positioning elements
export const getFloatingButtonPosition = (additionalOffset: number = 0) => {
  return (
    FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM_MARGIN + additionalOffset
  );
};

// Get the total height of the floating tab bar including margins
export const getFloatingTabBarTotalHeight = () => {
  return FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM_MARGIN;
};

// Get safe area insets for consistent spacing
export const getSafeAreaInsets = () => {
  return {
    bottom: FLOATING_TAB_BAR_BOTTOM_MARGIN,
    top: 20, // Standard top padding
    horizontal: 20, // Standard horizontal padding
  };
};
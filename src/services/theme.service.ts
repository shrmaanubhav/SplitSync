// Theme Service
import { useStore } from '../store/useStore';

// Light theme colors
export const lightTheme = {
  // Background colors
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',

  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Border colors
  border: '#EEEEEE',
  borderDark: '#DDDDDD',

  // Primary color (orange)
  primary: '#FF7A45',
  primaryLight: '#FFA06F',
  primaryDark: '#E5632F',
  onPrimary: '#FFFFFF',

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  elevation: 3,
};

// Dark theme colors
export const darkTheme = {
  // Background colors
  background: '#121212',
  cardBackground: '#1E1E1E',
  headerBackground: '#252525',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',

  // Border colors
  border: '#333333',
  borderDark: '#444444',

  // Primary color (orange)
  primary: '#FF8C66',
  primaryLight: '#FFAA8A',
  primaryDark: '#E56F4D',
  onPrimary: '#0D0D0D',

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.6)',
  elevation: 2,
};

// Function to get current theme based on store
export const getCurrentTheme = () => {
  const { darkMode } = useStore.getState();
  return darkMode ? darkTheme : lightTheme;
};

// Function to get theme colors
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? darkTheme : lightTheme;
};

export default {
  lightTheme,
  darkTheme,
  getCurrentTheme,
  getThemeColors,
};

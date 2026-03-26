import React, { ReactNode } from 'react';
import { View, StatusBar } from 'react-native';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { darkMode } = useStore();
  const theme = getCurrentTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBackground}
      />
      {children}
    </View>
  );
};

export default ThemeProvider;

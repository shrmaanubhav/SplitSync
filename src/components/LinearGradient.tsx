import React from 'react';
import { View, StyleSheet } from 'react-native';

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children: React.ReactNode;
  style?: any;
}

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  children,
  style,
}) => {
  // For simplicity, we'll create a gradient effect using background colors
  // In a real app, you would use react-native-linear-gradient library

  const gradientStyle = {
    background: `linear-gradient(to right, ${colors.join(', ')})`,
  };

  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    // Gradient styling would be applied here
  },
});

export default LinearGradient;

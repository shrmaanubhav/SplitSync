import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BlurViewProps {
  intensity?: number;
  children: React.ReactNode;
  style?: any;
}

const BlurView: React.FC<BlurViewProps> = ({ 
  intensity = 50,
  children,
  style 
}) => {
  // For simplicity, we'll create a blur effect using opacity
  // In a real app, you would use react-native-blur library
  
  return (
    <View style={[styles.container, { opacity: intensity / 100 }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
});

export default BlurView;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  value: number | string;
  color?: string;
  textColor?: string;
  style?: any;
}

const Badge: React.FC<BadgeProps> = ({
  value,
  color = '#FF3B30',
  textColor = '#FFFFFF',
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Badge;

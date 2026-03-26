import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TagProps {
  text: string;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  style?: any;
}

const Tag: React.FC<TagProps> = ({
  text,
  onPress,
  color = '#E5E5EA',
  textColor = '#333',
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color }, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Tag;

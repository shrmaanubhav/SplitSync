import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getFloatingButtonPosition } from '../utils/layout.utils';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  style?: any;
  bottomOffset?: number; // Additional offset for special cases
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  label,
  style,
  bottomOffset = 0,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { bottom: getFloatingButtonPosition(bottomOffset) },
        style,
      ]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
});

export default FloatingActionButton;

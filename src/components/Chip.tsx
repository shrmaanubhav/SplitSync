import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ChipProps {
  label: string;
  onPress?: () => void;
  onClose?: () => void;
  selected?: boolean;
  style?: any;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  onClose,
  selected = false,
  style,
}) => {
  return (
    <View style={[styles.container, selected && styles.selected, style]}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
      </TouchableOpacity>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    margin: 4,
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Chip;

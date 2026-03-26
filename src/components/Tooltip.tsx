import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  style?: any;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, style }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        style={styles.trigger}
      >
        {children}
      </TouchableOpacity>

      {visible && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{text}</Text>
          <View style={styles.arrow} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    // Trigger area for the tooltip
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  arrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -5 }],
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333',
  },
});

export default Tooltip;

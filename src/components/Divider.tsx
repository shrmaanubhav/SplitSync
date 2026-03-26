import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DividerProps {
  color?: string;
  thickness?: number;
  style?: any;
}

const Divider: React.FC<DividerProps> = ({
  color = '#EEE',
  thickness = 1,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color, height: thickness },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default Divider;

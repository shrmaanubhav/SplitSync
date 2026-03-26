import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: any;
}

const Stepper: React.FC<StepperProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
}) => {
  const increment = () => {
    if (value + step <= max) {
      onValueChange(value + step);
    }
  };

  const decrement = () => {
    if (value - step >= min) {
      onValueChange(value - step);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, value <= min && styles.disabledButton]}
        onPress={decrement}
        disabled={value <= min}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity
        style={[styles.button, value >= max && styles.disabledButton]}
        onPress={increment}
        disabled={value >= max}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  value: {
    marginHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default Stepper;

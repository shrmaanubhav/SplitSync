import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterProps {
  options: FilterOption[];
  selectedOption: string;
  onOptionSelect: (key: string) => void;
  style?: any;
}

const Filter: React.FC<FilterProps> = ({
  options,
  selectedOption,
  onOptionSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map(option => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.option,
            selectedOption === option.key && styles.selectedOption,
          ]}
          onPress={() => onOptionSelect(option.key)}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === option.key && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 5,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Filter;

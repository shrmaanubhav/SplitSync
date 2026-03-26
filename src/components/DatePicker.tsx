import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/format';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  style?: any;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, style }) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text style={styles.dateText}>{formatDate(value.toISOString())}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DatePicker;

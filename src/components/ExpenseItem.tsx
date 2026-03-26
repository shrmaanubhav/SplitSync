import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate } from '../utils/format';

interface ExpenseItemProps {
  description: string;
  amount: number;
  paidBy: string;
  group: string;
  date: string;
  onPress: () => void;
  style?: any;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  description,
  amount,
  paidBy,
  group,
  date,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.paidBy}>Paid by {paidBy}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
      <Text style={styles.group}>{group}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paidBy: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  group: {
    fontSize: 14,
    color: '#007AFF',
  },
});

export default ExpenseItem;

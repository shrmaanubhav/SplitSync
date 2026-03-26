import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/format';

interface BalanceItemProps {
  name: string;
  amount: number;
  isPositive?: boolean;
  style?: any;
}

const BalanceItem: React.FC<BalanceItemProps> = ({
  name,
  amount,
  isPositive = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.name}>{name}</Text>
      <Text
        style={[styles.amount, isPositive ? styles.positive : styles.negative]}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  name: {
    fontSize: 16,
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#4CD964',
  },
  negative: {
    color: '#FF3B30',
  },
});

export default BalanceItem;

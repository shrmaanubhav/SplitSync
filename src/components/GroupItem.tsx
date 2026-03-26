import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../utils/format';

interface GroupItemProps {
  name: string;
  memberCount: number;
  totalExpenses: number;
  yourBalance: number;
  onPress: () => void;
  style?: any;
}

const GroupItem: React.FC<GroupItemProps> = ({
  name,
  memberCount,
  totalExpenses,
  yourBalance,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.memberCount}>{memberCount} members</Text>
      </View>
      <Text style={styles.description}>No description</Text>
      <View style={styles.footer}>
        <Text style={styles.totalExpenses}>
          Total: {formatCurrency(totalExpenses)}
        </Text>
        <Text
          style={[
            styles.yourBalance,
            yourBalance >= 0 ? styles.positive : styles.negative,
          ]}
        >
          Your balance: {formatCurrency(yourBalance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalExpenses: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  yourBalance: {
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

export default GroupItem;

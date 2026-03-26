// Expenses Screen
// Simplified implementation to avoid dependency issues

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { expenseService } from '../services/expense.service';
import { formatCurrency, formatDate } from '../utils/format';
import { currencyService } from '../services/currency.service';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getFloatingButtonPosition } from '../utils/layout';

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    // Navigate to add expense screen
    // @ts-ignore
    navigation.navigate('AddExpense', { group: null });
  };

  const theme = getCurrentTheme();

  const renderExpenseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.expenseItem, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.expenseHeader}>
        <Text style={[styles.expenseDescription, { color: theme.textPrimary }]}>
          {item.description}
        </Text>
        <Text style={[styles.expenseAmount, { color: theme.textPrimary }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <View style={styles.expenseFooter}>
        <Text style={[styles.expenseGroup, { color: theme.textSecondary }]}>
          {item.group?.name || 'Unknown group'}
        </Text>
        <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
          {formatDate(item.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
              No expenses yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Add your first expense to get started
            </Text>
          </View>
        }
      />

      <Button
        title="Add Expense"
        onPress={handleAddExpense}
        style={styles.fab}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  expenseItem: {
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseGroup: {
    fontSize: 14,
  },
  expenseDate: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: getFloatingButtonPosition(20), // Use utility function for proper positioning
    right: 20,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ExpensesScreen;
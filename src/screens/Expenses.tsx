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
import { formatCurrency, formatDate } from '../utils/format';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import { getFloatingButtonPosition } from '../utils/layout';
import firestore from '@react-native-firebase/firestore';

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const theme = getCurrentTheme();

  // ---------- FETCH ----------
  const fetchExpenses = async () => {
    try {
      const snap = await firestore()
        .collection('expenses')
        .orderBy('createdAt', 'desc')
        .get();

      const data = snap.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
      }));

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

  // ---------- NAV ----------
  const handleAddExpense = () => {
    // @ts-ignore
    navigation.navigate('AddExpense', { group: null });
  };

  // ---------- UI ----------
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
          {item.groupId || 'No group'}
        </Text>
        <Text style={[styles.expenseDate, { color: theme.textSecondary }]}>
          {formatDate(item.createdAt)}
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
              Add your first expense
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

// ---------- STYLES ----------
const styles = StyleSheet.create({
  listContainer: {
    padding: 20,
  },
  expenseItem: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    bottom: getFloatingButtonPosition(20),
    right: 20,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default ExpensesScreen;
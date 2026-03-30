import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import Button from '../components/Button';
import { getCurrentTheme } from '../services/theme.service';
import { expenseService } from '../services/expense.service';
import { getBalances } from '../services/balance.service';
import { getSettlements } from '../services/settlement.service';
import { RootStackParamList } from '../types/navigation.types';

const GroupDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  const { group } = route.params as any;

  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [settlements, setSettlements] = useState<any[]>([]);

  const theme = getCurrentTheme();

  async function load() {
    if (!group?._id) return;

    const exp = await expenseService.getGroupExpenses(group._id);

    console.log('FETCHED EXPENSES:', exp); // ✅ debug

    const bal = getBalances(group.members || [], exp);
    const set = getSettlements(bal);

    setExpenses(exp);
    setBalances(bal);
    setSettlements(set);
  }

  // ✅ FIX: always reload when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [group?._id])
  );

  const renderExpense = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={{ color: theme.textPrimary }}>
        ₹{item.amount}
      </Text>

      <Text style={{ color: theme.textSecondary }}>
        {item.description || 'No description'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* TITLE */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {group?.name}
      </Text>

      {/* BALANCES */}
      <Text style={[styles.section, { color: theme.textPrimary }]}>
        Balances
      </Text>

      {Object.keys(balances).length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>
          No balances yet
        </Text>
      ) : (
        Object.entries(balances).map(([u, a]: any) => (
          <Text key={u} style={{ color: theme.textPrimary }}>
            {a > 0
              ? `${u} gets ₹${a}`
              : a < 0
              ? `${u} owes ₹${-a}`
              : `${u} settled`}
          </Text>
        ))
      )}

      {/* SETTLEMENTS */}
      <Text style={[styles.section, { color: theme.textPrimary }]}>
        Settle Up
      </Text>

      {settlements.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>
          Nothing to settle
        </Text>
      ) : (
        settlements.map((s, i) => (
          <Text key={i} style={{ color: theme.textPrimary }}>
            {s.from} → {s.to} ₹{s.amount}
          </Text>
        ))
      )}

      {/* EXPENSE LIST */}
      {expenses.length === 0 ? (
        <Text style={{ color: theme.textSecondary, marginTop: 20 }}>
          No expenses yet
        </Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item._id} // ✅ FIXED
          contentContainerStyle={{ marginTop: 20 }}
        />
      )}

      {/* ADD EXPENSE */}
      <Button
        title="Add Expense"
        onPress={() =>
          navigation.navigate('AddExpense', { group })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  section: { marginTop: 20, fontWeight: 'bold' },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
});

export default GroupDetailScreen;
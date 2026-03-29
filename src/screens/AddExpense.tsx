import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import Button from '../components/Button';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import ExpenseSplitSelector from '../components/ExpenseSplitSelector';
import NonGroupExpenseSplitSelector from '../components/NonGroupExpenseSplitSelector';
import CategoryIcon from '../components/CategoryIcon';
import {
  expenseCategories,
  getDefaultCategory,
} from '../data/categories';
import { ExpenseCategory } from '../data/categories';

import firestore from '@react-native-firebase/firestore';

// ---------------- TYPES ----------------
type RootStackParamList = {
  CategorySelector: {
    onSelectCategory: (category: ExpenseCategory) => void;
    selectedCategory?: ExpenseCategory;
  };
};

const AddExpenseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const routeParams = route.params as { group?: any } | undefined;
  const group = routeParams?.group;

  const { user } = useStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>(
    getDefaultCategory()
  );

  const theme = getCurrentTheme();

  // ---------- AUTO CATEGORY ----------
  useEffect(() => {
    if (description) {
      const lower = description.toLowerCase();
      for (const cat of expenseCategories) {
        if (
          lower.includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(lower)
        ) {
          setCategory(cat);
          break;
        }
      }
    }
  }, [description]);

  const handleSelectCategory = (selected: ExpenseCategory) => {
    setCategory(selected);
  };

  // ---------- ADD EXPENSE ----------
  const handleAddExpense = async () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    if (!splits || splits.length === 0) {
      Alert.alert('Error', 'Add participants');
      return;
    }

    let total = 0;
    for (const s of splits) {
      const val = parseFloat(s.amount || '0');
      if (isNaN(val)) {
        Alert.alert('Error', 'Invalid split');
        return;
      }
      total += val;
    }

    if (Math.abs(total - amountValue) > 0.01) {
      Alert.alert('Error', 'Split mismatch');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        description,
        amount: amountValue,
        paidBy: user?._id,
        groupId: group?._id || null,
        splits: splits.map(s => ({
          userId: s.id || s._id,
          amount: parseFloat(s.amount),
        })),
        category: category.id,
        createdAt: Date.now(),
      };

      await firestore().collection('expenses').add(expenseData);

      Alert.alert('Success', 'Expense added', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Add Expense
          </Text>

          {/* GROUP */}
          {group ? (
            <Text style={{ color: theme.textSecondary }}>
              Group: {group.name}
            </Text>
          ) : (
            <Text style={{ color: theme.textSecondary }}>
              No group selected
            </Text>
          )}

          {/* DESCRIPTION */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground }]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />

          {/* CATEGORY */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CategorySelector', {
                onSelectCategory: handleSelectCategory,
                selectedCategory: category,
              })
            }
          >
            <CategoryIcon category={category} size={40} />
          </TouchableOpacity>

          {/* AMOUNT */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground }]}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* SPLITS */}
          {group ? (
            <ExpenseSplitSelector
              groupMembers={group.members || []}
              paidById={user?._id || ''}
              totalAmount={parseFloat(amount) || 0}
              onSplitsChange={setSplits}
            />
          ) : (
            <NonGroupExpenseSplitSelector
              paidById={user?._id || ''}
              totalAmount={parseFloat(amount) || 0}
              onSplitsChange={setSplits}
            />
          )}

          <Button
            title="Add Expense"
            onPress={handleAddExpense}
            loading={loading}
          />
        </ScrollView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
});

export default AddExpenseScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import ExpenseSplitSelector from '../components/ExpenseSplitSelector';
import { expenseService } from '../services/expense.service';
import firestore from '@react-native-firebase/firestore';

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const { user } = useStore();
  const theme = getCurrentTheme();

  const [group, setGroup] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------- FETCH GROUP ----------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(doc => {
        if (doc.exists()) {
          setGroup({ _id: doc.id, ...doc.data() });
        }
      });

    return unsubscribe;
  }, [groupId]);

  // ---------- GUARD ----------
  if (!group) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: theme.textPrimary }}>
          Loading group...
        </Text>
      </View>
    );
  }

  // ---------- HANDLER ----------
  async function handleAddExpense() {
    if (!user?._id) {
      Alert.alert('Error', 'User not loaded');
      return;
    }

    const amt = Number(amount);

    if (!description || isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Invalid input');
      return;
    }

    const participants =
      splits.length > 0
        ? splits.map(s => s.id || s._id).filter(Boolean)
        : group.members;

    if (!participants.length) {
      Alert.alert('Error', 'No participants');
      return;
    }

    try {
      setLoading(true);

      await expenseService.createExpense({
        groupId,
        paidBy: user._id,
        amount: amt,
        participants,
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI ----------
  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Add Expense
          </Text>

          <Text style={{ color: theme.textPrimary, marginBottom: 10 }}>
            Group: {group.name}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                borderColor: theme.border,
                backgroundColor: theme.cardBackground,
              },
            ]}
            placeholder="Description"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                borderColor: theme.border,
                backgroundColor: theme.cardBackground,
              },
            ]}
            placeholder="Amount"
            placeholderTextColor={theme.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <ExpenseSplitSelector
            groupMembers={group.members || []}
            paidById={user?._id || ''}
            totalAmount={parseFloat(amount) || 0}
            onSplitsChange={setSplits}
          />

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
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

  // Handle Firebase's uid vs old MongoDB _id
  const currentUserId = user?._id || '';

  const [group, setGroup] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<any[]>([]);
  
  // Default to the current user being the payer to save them a click
  const [paidBy, setPaidBy] = useState<string>(currentUserId); 
  const [loading, setLoading] = useState(false);

  const [showPayerDropdown, setShowPayerDropdown] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  // ---------- FETCH GROUP ----------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(doc => {
        if (doc.exists()) {
          setGroup({ id: doc.id, ...doc.data() });
        }
      });

    return unsubscribe;
  }, [groupId]);

  if (!group) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: theme.textPrimary }}>Loading group...</Text>
      </View>
    );
  }

  // ---------- HANDLER ----------
  async function handleAddExpense() {
    if (!currentUserId) {
      Alert.alert('Error', 'User not loaded');
      return;
    }

    const amt = Number(amount);

    if (!description || isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid description and amount.');
      return;
    }

    if (!paidBy) {
      Alert.alert('Error', 'Please select who paid.');
      return;
    }

    if (!splits.length) {
      Alert.alert('Error', 'Please select participants to split the bill.');
      return;
    }

    // Format splits to include the math, not just IDs
    const formattedSplits = splits.map(s => ({
      userId: s.id,
      amountOwed: Number(s.amount) || 0
    }));

    // Validation: Ensure unequal splits sum up to total
    const totalSplitAmount = formattedSplits.reduce((acc, curr) => acc + curr.amountOwed, 0);
    if (Math.abs(totalSplitAmount - amt) > 0.05) {
      Alert.alert('Error', 'The split amounts must equal the total bill.');
      return;
    }

    try {
      setLoading(true);

      await expenseService.createExpense({
        groupId,
        description,
        paidBy,
        amount: amt,
        participants: formattedSplits, 
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  }

  // ---------- HELPER ----------
  const getMemberName = (memberId: string) => {
    if (memberId === currentUserId) return 'You';
    // If group.members contains objects, find the name. Otherwise fallback to ID.
    const memberObj = group.members?.find((m: any) => (m._id || m.id || m) === memberId);
    return memberObj?.name || memberId;
  };

  // ---------- UI ----------
  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Add Expense
          </Text>

          <Text style={{ color: theme.textSecondary, marginBottom: 20, fontSize: 16 }}>
            Group: <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>{group.name}</Text>
          </Text>

          {/* DESCRIPTION */}
          <TextInput
            style={[styles.input, box(theme)]}
            placeholder="What was this for? (e.g. Dinner)"
            placeholderTextColor={theme.textTertiary}
            value={description}
            onChangeText={setDescription}
          />

          {/* AMOUNT */}
          <TextInput
            style={[styles.input, box(theme), styles.amountInput]}
            placeholder="₹ 0.00"
            placeholderTextColor={theme.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* PAID BY */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Paid by</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPayerDropdown(!showPayerDropdown)}
            style={[styles.input, styles.dropdownToggle, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={{ color: paidBy ? theme.textPrimary : theme.textSecondary, fontSize: 16 }}>
              {paidBy ? getMemberName(paidBy) : 'Select payer'}
            </Text>
            <Text style={{ color: theme.textSecondary }}>{showPayerDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPayerDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {(group.members || []).map((member: any) => {
                const memberId = member._id || member.id || member;
                return (
                  <TouchableOpacity
                    key={memberId}
                    onPress={() => {
                      setPaidBy(memberId);
                      setShowPayerDropdown(false);
                    }}
                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                  >
                    <Text style={{ color: theme.textPrimary, fontSize: 16 }}>
                      {getMemberName(memberId)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* SPLIT BETWEEN */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Split between</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowSplit(!showSplit)}
            style={[styles.input, styles.dropdownToggle, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={{ color: splits.length > 0 ? theme.primary : theme.textSecondary, fontSize: 16, fontWeight: splits.length > 0 ? '600' : 'normal' }}>
              {splits.length > 0
                ? `${splits.length} members selected`
                : 'Tap to select members'}
            </Text>
            <Text style={{ color: theme.textSecondary }}>{showSplit ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showSplit && (
            <ExpenseSplitSelector
              groupMembers={(group.members || []).map((m: any) => {
                const memberId = m._id || m.id || m;
                return { id: memberId, name: getMemberName(memberId) };
              })}
              paidById={paidBy}
              totalAmount={parseFloat(amount) || 0}
              onSplitsChange={setSplits}
            />
          )}

          {/* SUBMIT */}
          <View style={{ marginTop: 20 }}>
            <Button
              title="Save Expense"
              onPress={handleAddExpense}
              loading={loading}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
};

// ---------- STYLES ----------
const box = (theme: any) => ({
  color: theme.textPrimary,
  borderColor: theme.border,
  backgroundColor: theme.cardBackground,
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 12,   
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    fontSize: 16,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 12,   
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownList: {
    borderRadius: 12,
    marginBottom: 20,
    marginTop: -10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,   
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
});

export default AddExpenseScreen;
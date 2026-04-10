import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import Button from '../components/Button';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import ExpenseSplitSelector from '../components/ExpenseSplitSelector';
import { expenseService } from '../services/expense.service';

// interface for our hydrated members (with real names)
interface FetchedMember {
  _id: string;
  name: string;
  phoneNumber?: string;
}

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params as { groupId: string };

  const { user } = useStore();
  const theme = getCurrentTheme();
  const currentUserId = user?._id || '';

  const [group, setGroup] = useState<any>(null);
  // We will store the hydrated user objects here
  const [hydratedMembers, setHydratedMembers] = useState<FetchedMember[]>([]); 
  const [fetchingMembers, setFetchingMembers] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<any[]>([]);
  const [paidBy, setPaidBy] = useState<string>(currentUserId); 
  const [loading, setLoading] = useState(false);

  const [showPayerDropdown, setShowPayerDropdown] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  // ---------- FETCH GROUP & HYDRATE MEMBERS ----------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(async doc => {
        if (doc.exists()) {
          const groupData = { id: doc.id, ...(doc.data() as any) };
          setGroup(groupData);

          const memberIds = groupData.members || [];
          if (memberIds.length > 0) {
            setFetchingMembers(true);
            try {
              const docs = await Promise.all(
                memberIds.map((id: string) => firestore().collection('users').doc(id).get())
              );
              
              const loadedUsers = docs.map((d: any) => ({
                _id: d.id,
                ...(d.data() as any),
              }));

              setHydratedMembers(loadedUsers);
            } catch (error) {
              console.error("Failed to load member names", error);
            } finally {
              setFetchingMembers(false);
            }
          }
        }
      });

    return unsubscribe;
  }, [groupId]);

  if (!group || fetchingMembers) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Loading group details...</Text>
        </View>
      </Screen>
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

    const formattedSplits = splits.map(s => ({
      userId: s.id,
      amountOwed: Number(s.amount) || 0
    }));

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
  // fetch the real name of a member by their ID (for displaying in the UI)
  const getMemberName = (memberId: string) => {
    if (memberId === currentUserId) return 'You';
    const memberObj = hydratedMembers.find(m => m._id === memberId);
    return memberObj?.name || 'Unknown User'; 
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
              {hydratedMembers.map((member) => (
                <TouchableOpacity
                  key={member._id}
                  onPress={() => {
                    setPaidBy(member._id);
                    setShowPayerDropdown(false);
                  }}
                  style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 16 }}>
                    {getMemberName(member._id)}
                  </Text>
                </TouchableOpacity>
              ))}
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
              groupMembers={hydratedMembers.map((m) => ({ 
                id: m._id, 
                name: getMemberName(m._id) 
              }))}
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
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
import { expenseService } from '../services/expense.service';
import { formatCurrency } from '../utils/format';
import { useStore } from '../store/useStore';
import { getCurrentTheme } from '../services/theme.service';
import Screen from '../components/Screen';
import ExpenseSplitSelector from '../components/ExpenseSplitSelector';
import NonGroupExpenseSplitSelector from '../components/NonGroupExpenseSplitSelector';
import CategoryIcon from '../components/CategoryIcon';
import {
  expenseCategories,
  getDefaultCategory,
  getCategoryById,
} from '../data/categories';
import { ExpenseCategory } from '../data/categories';

// Define navigation parameter types
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

  // Auto-detect category based on description
  useEffect(() => {
    if (description) {
      const lowerDescription = description.toLowerCase();
      for (const cat of expenseCategories) {
        if (
          lowerDescription.includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(lowerDescription)
        ) {
          setCategory(cat);
          break;
        }
      }
    }
  }, [description]);

  const handleSelectCategory = (selectedCategory: ExpenseCategory) => {
    setCategory(selectedCategory);
  };

  const handleAddExpense = async () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Validate category
    if (!category || !category.id) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Validate that we have splits
    if (!splits || splits.length === 0) {
      Alert.alert('Error', 'Please add at least one person to split with');
      return;
    }

    // Validate that all participants have valid amounts
    let totalSplit = 0;
    for (const split of splits) {
      const splitAmount = parseFloat(split.amount || '0');
      if (isNaN(splitAmount) || splitAmount < 0) {
        Alert.alert(
          'Error',
          `Please enter a valid amount for ${split.name || 'participant'}`
        );
        return;
      }
      totalSplit += splitAmount;
    }

    const difference = Math.abs(totalSplit - amountValue);
    if (difference > 0.01) {
      Alert.alert(
        'Error',
        `Split amounts must sum to total amount (difference: ${difference.toFixed(
          2
        )})`
      );
      return;
    }

    // Validate that all splits have valid user IDs
    for (const split of splits) {
      const userId = split.id || split._id || split.user || '';
      if (!userId) {
        Alert.alert('Error', 'Invalid participant data. Please try again.');
        return;
      }
    }

    setLoading(true);
    try {
      const expenseData = {
        description,
        amount: amountValue,
        paidBy: user?.id || '',
        group: group?._id || null,
        splits: splits.map(split => ({
          user: split.id || split._id || split.user || '', // Handle different user ID formats
          amount: parseFloat(split.amount || '0'),
        })),
        category: category.id,
        date: new Date().toISOString(),
      };

      await expenseService.createExpense(expenseData);

      Alert.alert('Success', 'Expense added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      // Provide more detailed error information
      let errorMessage = 'Failed to add expense';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = error.response.data.errors
            .map((e: any) => e.msg)
            .join(', ');
        }
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const theme = getCurrentTheme();

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Add New Expense
          </Text>

          {group ? (
            <View
              style={[
                styles.groupInfo,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>
                Group
              </Text>
              <Text style={[styles.groupName, { color: theme.textPrimary }]}>
                {group.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noGroupText, { color: theme.textSecondary }]}>
              This expense will not be associated with any group
            </Text>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Description
            </Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBackground,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter expense description"
                placeholderTextColor={theme.textTertiary}
              />
              <TouchableOpacity
                style={styles.categoryIconContainer}
                onPress={() =>
                  navigation.navigate('CategorySelector', {
                    onSelectCategory: handleSelectCategory,
                    selectedCategory: category,
                  })
                }
              >
                <CategoryIcon category={category} size={40} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Paid by
            </Text>
            <Text
              style={[
                styles.paidBy,
                {
                  color: theme.textPrimary,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              {user?.name || 'You'}
            </Text>
          </View>

          {group ? (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Split Among
              </Text>
              <ExpenseSplitSelector
                groupMembers={group.members || []}
                paidById={user?.id || ''}
                totalAmount={parseFloat(amount) || 0}
                onSplitsChange={setSplits}
                style={{ backgroundColor: theme.cardBackground }}
              />
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                Split With
              </Text>
              <NonGroupExpenseSplitSelector
                paidById={user?.id || ''}
                totalAmount={parseFloat(amount) || 0}
                onSplitsChange={setSplits}
                style={{ backgroundColor: theme.cardBackground }}
              />
            </View>
          )}

          <Button
            title="Add Expense"
            onPress={handleAddExpense}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />
        </ScrollView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  groupInfo: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  noGroupText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryIconContainer: {
    marginLeft: 10,
  },
  paidBy: {
    fontSize: 16,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
  },
  button: {
    marginTop: 20,
    marginBottom: 20, // Add some bottom margin to ensure visibility above floating tab bar
  },
});

export default AddExpenseScreen;
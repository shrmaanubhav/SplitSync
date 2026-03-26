import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Button from './Button';
import { expenseService } from '../services/expense.service';

interface ExpenseFormProps {
  groupId?: string;
  onSubmit?: () => void;
}

interface ExpenseSplit {
  user: string;
  amount: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupId, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splits, setSplits] = useState<ExpenseSplit[]>([
    { user: '', amount: '' },
  ]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const addSplit = () => {
    setSplits([...splits, { user: '', amount: '' }]);
  };

  const updateSplit = (
    index: number,
    field: keyof ExpenseSplit,
    value: string
  ) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
  };

  const removeSplit = (index: number) => {
    if (splits.length <= 1) {
      Alert.alert('Error', 'At least one split is required');
      return;
    }
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
  };

  const handleSubmit = async () => {
    if (!description || !amount || !paidBy || !groupId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate splits
    const totalSplitAmount = splits.reduce(
      (sum, split) => sum + parseFloat(split.amount || '0'),
      0
    );
    if (Math.abs(totalSplitAmount - parseFloat(amount)) > 0.01) {
      Alert.alert('Error', 'Split amounts must sum to total amount');
      return;
    }

    setLoading(true);

    try {
      await expenseService.createExpense({
        description,
        amount: parseFloat(amount),
        paidBy,
        group: groupId,
        splits: splits.map(split => ({
          user: split.user,
          amount: parseFloat(split.amount),
        })),
        category,
      });

      Alert.alert('Success', 'Expense added successfully');
      if (onSubmit) onSubmit();
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Expense</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Paid By *</Text>
        <TextInput
          style={styles.input}
          value={paidBy}
          onChangeText={setPaidBy}
          placeholder="User ID who paid"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., Food, Travel, Utilities"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Split Among</Text>
        {splits.map((split, index) => (
          <View key={index} style={styles.splitRow}>
            <TextInput
              style={[styles.input, styles.splitInput]}
              value={split.user}
              onChangeText={value => updateSplit(index, 'user', value)}
              placeholder="User ID"
            />
            <TextInput
              style={[styles.input, styles.splitInput]}
              value={split.amount}
              onChangeText={value => updateSplit(index, 'amount', value)}
              placeholder="Amount"
              keyboardType="decimal-pad"
            />
            <Button
              title="Remove"
              onPress={() => removeSplit(index)}
              variant="danger"
              style={styles.removeButton}
            />
          </View>
        ))}
        <Button
          title="Add Another Person"
          onPress={addSplit}
          variant="secondary"
          style={styles.addButton}
        />
      </View>

      <Button
        title="Add Expense"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  splitRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  splitInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  addButton: {
    marginTop: 10,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default ExpenseForm;

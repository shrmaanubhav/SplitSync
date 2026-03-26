import React from 'react';
import { View, Button } from 'react-native';
import { addExpense } from '../services/firestore';

export default function HomeScreen() {

  const test = async () => {
    await addExpense({
      groupId: 'test',
      amount: 100,
      paidBy: 'user1',
      split: [{ userId: 'user1', amount: 100 }],
      createdAt: Date.now(),
    });
  };

  return (
    <View style={{ marginTop: 50 }}>
      <Button title="Add Expense" onPress={test} />
    </View>
  );
}
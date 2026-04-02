import firestore from '@react-native-firebase/firestore';

export type Expense = {
  id: string;
  paidBy: string;
  amount: number;
  // ✅ FIX 1: Updated to expect the math array instead of string array
  participants: { userId: string; amountOwed: number }[];
  // ✅ FIX 2: Relaxed from 'number' to 'any' to accept Firebase Timestamps
  createdAt: any; 
};

type CreateExpenseInput = {
  groupId: string;
  paidBy: string;
  amount: number;
  participants: { userId: string; amountOwed: number }[];
  description: string; 
};

export const expenseService = {
  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    const docRef = firestore()
      .collection('groups')
      .doc(data.groupId)
      .collection('expenses')
      .doc();

    const expense: Expense = {
      id: docRef.id,
      paidBy: data.paidBy,
      amount: data.amount,
      participants: data.participants,
      // ✅ FIX 3: Replaced Date.now() with Firebase's native timestamp
      createdAt: firestore.Timestamp.now(), 
    };

    await docRef.set(expense);

    return expense;
  },

  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    const snapshot = await firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Expense);
  },
};
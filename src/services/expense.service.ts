import firestore from '@react-native-firebase/firestore';

export type Expense = {
  id: string;
  paidBy: string;
  amount: number;
  participants: string[];
  createdAt: number;
};

type CreateExpenseInput = {
  groupId: string;
  paidBy: string;
  amount: number;
  participants: string[];
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
      createdAt: Date.now(),
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
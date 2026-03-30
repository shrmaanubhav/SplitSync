import firestore from '@react-native-firebase/firestore';

export type Expense = {
  id: string;
  groupId: string;
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

const expensesRef = firestore().collection('expenses');

export const expenseService = {
  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    const docRef = expensesRef.doc();

    const expense: Expense = {
      id: docRef.id,
      groupId: data.groupId,
      paidBy: data.paidBy,
      amount: data.amount,
      participants: data.participants,
      createdAt: Date.now(),
    };

    await docRef.set(expense);

    return expense;
  },

  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    const snapshot = await expensesRef
      .where('groupId', '==', groupId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Expense);
  },
};
import firestore from '@react-native-firebase/firestore';

export type Expense = {
  id: string;
  description: string; 
  paidBy: string;
  amount: number;
  participants: { userId: string; amountOwed: number }[];
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
      description: data.description, 
      paidBy: data.paidBy,
      amount: data.amount,
      participants: data.participants,
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
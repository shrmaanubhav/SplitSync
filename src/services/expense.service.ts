// Expense Service
// Simplified implementation to avoid dependency issues

// Import API client
import api from './api';

interface ExpenseSplit {
  user: string;
  amount: number;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  group: string;
  splits: ExpenseSplit[];
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateExpenseData {
  description: string;
  amount: number;
  paidBy: string;
  group: string | null;
  splits: ExpenseSplit[];
  category?: string;
  date?: string;
}

export const expenseService = {
  // Create a new expense
  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  // Get all expenses for current user (global view)
  async getAllExpenses(): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },

  // Get expenses by group
  async getExpensesByGroup(groupId: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>(`/expenses/group/${groupId}`);
    return response.data;
  },

  // Get expense by ID
  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  // Update expense
  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  async deleteExpense(id: string): Promise<any> {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

export default expenseService;

// Zustand Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email?: string;
  currency: string;
  phoneNumber: string;
  bio?: string;
  createdAt?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  groupId: string;
  splits: { userId: string; amount: number }[];
  date: string;
}

interface Balance {
  groupId: string;
  groupName: string;
  totalOwed: number;
  totalDue: number;
  netBalance: number;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  groups: Group[];
  currentGroup: Group | null;
  expenses: Expense[];
  currentExpense: Expense | null;
  balances: Balance[];
  darkMode: boolean;
  loading: boolean;

  // Authentication actions
  setIsAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;

  // State setters
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setExpenses: (expenses: Expense[]) => void;
  setCurrentExpense: (expense: Expense | null) => void;
  setBalances: (balances: Balance[]) => void;
  setDarkMode: (darkMode: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Currency actions
  setUserCurrency: (currency: string) => void;
  updateUserCurrency: (
    userId: string,
    currency: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Group actions
  createGroup: (
    groupData: any
  ) => Promise<{ success: boolean; error?: string }>;
  updateGroup: (
    groupId: string,
    groupData: any
  ) => Promise<{ success: boolean; error?: string }>;
  deleteGroup: (
    groupId: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Expense actions
  createExpense: (
    expenseData: any
  ) => Promise<{ success: boolean; error?: string }>;
  updateExpense: (
    expenseId: string,
    expenseData: any
  ) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (
    expenseId: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Settlement actions
  createSettlement: (
    settlementData: any
  ) => Promise<{ success: boolean; error?: string }>;
  deleteSettlement: (
    settlementId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      groups: [],
      currentGroup: null,
      expenses: [],
      currentExpense: null,
      balances: [],
      darkMode: false, // Default to light theme
      loading: false,

      setIsAuthenticated: authenticated =>
        set({ isAuthenticated: authenticated }),
      setUser: user => set({ user }),
      setToken: token => set({ token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),

      setGroups: groups => set({ groups }),
      setCurrentGroup: group => set({ currentGroup: group }),
      setExpenses: expenses => set({ expenses }),
      setCurrentExpense: expense => set({ currentExpense: expense }),
      setBalances: balances => set({ balances }),
      setDarkMode: darkMode => set({ darkMode }),
      setLoading: loading => set({ loading }),

      // Currency actions
      setUserCurrency: currency => {
        const state = get();
        if (state.user) {
          set({
            user: {
              ...state.user,
              currency,
            },
          });
        }
      },
      updateUserCurrency: async (userId, currency) => {
        console.log('Updating user currency:', userId, currency);
        // In a real app, this would make an API call
        const state = get();
        if (state.user && state.user.id === userId) {
          set({
            user: {
              ...state.user,
              currency,
            },
          });
        }
        return { success: true };
      },

      // Mock implementations for all actions
      login: async (credentials: any) => {
        console.log('Logging in with credentials:', credentials);
        // In a real app, this would make an API call
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            name: 'John Doe',
            email: credentials.email,
            phoneNumber: '+919876543210',
            currency: 'INR',
            bio: 'This is a sample bio for the user',
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
        return { success: true };
      },
      register: async (userData: any) => {
        console.log('Registering user:', userData);
        // In a real app, this would make an API call
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber || '+919876543210',
            currency: 'INR',
            bio: 'This is a sample bio for the user',
            createdAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        });
        return { success: true };
      },
      createGroup: async (groupData: any) => {
        console.log('Creating group:', groupData);
        // In a real app, this would make an API call
        return { success: true };
      },
      updateGroup: async (groupId: string, groupData: any) => {
        console.log('Updating group:', groupId, groupData);
        // In a real app, this would make an API call
        return { success: true };
      },
      deleteGroup: async (groupId: string) => {
        console.log('Deleting group:', groupId);
        // In a real app, this would make an API call
        return { success: true };
      },
      createExpense: async (expenseData: any) => {
        console.log('Creating expense:', expenseData);
        // In a real app, this would make an API call
        return { success: true };
      },
      updateExpense: async (expenseId: string, expenseData: any) => {
        console.log('Updating expense:', expenseId, expenseData);
        // In a real app, this would make an API call
        return { success: true };
      },
      deleteExpense: async (expenseId: string) => {
        console.log('Deleting expense:', expenseId);
        // In a real app, this would make an API call
        return { success: true };
      },
      createSettlement: async (settlementData: any) => {
        console.log('Creating settlement:', settlementData);
        // In a real app, this would make an API call
        return { success: true };
      },
      deleteSettlement: async (settlementId: string) => {
        console.log('Deleting settlement:', settlementId);
        // In a real app, this would make an API call
        return { success: true };
      },
    }),
    {
      name: 'splitter-storage',
      storage: {
        getItem: async name => {
          const item = await AsyncStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async name => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useStore;
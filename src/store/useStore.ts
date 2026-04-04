import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// types

interface User {
  _id: string;
  uid?: string;
  name: string;
  phoneNumber: string;
  currency: string;
  createdAt?: number;
  bio?: string;
  friends?:string[];
}

interface Group {
  _id: string;
  name: string;
  members: string[];
}

interface Expense {
  _id: string;
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

// store

interface AppState {
  // auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // app data
  groups: Group[];
  currentGroup: Group | null;
  expenses: Expense[];
  currentExpense: Expense | null;
  balances: Balance[];

  // ui
  darkMode: boolean;
  loading: boolean;

  // app locked state
  isUnlocked: boolean;
  setUnlocked: (val: boolean) => void;
  

  // auth actions
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // state setters
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setExpenses: (expenses: Expense[]) => void;
  setCurrentExpense: (expense: Expense | null) => void;
  setBalances: (balances: Balance[]) => void;
  setDarkMode: (darkMode: boolean) => void;
  setLoading: (loading: boolean) => void;

  // user actions
  setUserCurrency: (currency: string) => void;
  updateUserCurrency: (currency: string) => void;
}

// implementation

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // state
      isAuthenticated: false,
      user: null,
      token: null,

      groups: [],
      currentGroup: null,
      expenses: [],
      currentExpense: null,
      balances: [],

      darkMode: false,
      loading: false,

      // auth
      setIsAuthenticated: (val) => set({ isAuthenticated: val }),

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      isUnlocked: false,
      setUnlocked: (val) => set({ isUnlocked: val }),


      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isUnlocked: false,
          groups: [],
          expenses: [],
          balances: [],
        }),

        updateUserCurrency: (currency) =>
          set((state) => {
            if (!state.user) return state;

            return {
              user: {
                ...state.user,
                currency,
              },
            };
          }),

      // state setters
      setGroups: (groups) => set({ groups }),

      setCurrentGroup: (group) => set({ currentGroup: group }),

      setExpenses: (expenses) => set({ expenses }),

      setCurrentExpense: (expense) => set({ currentExpense: expense }),

      setBalances: (balances) => set({ balances }),

      setDarkMode: (darkMode) => set({ darkMode }),

      setLoading: (loading) => set({ loading }),

      // user
      setUserCurrency: (currency) => {
        const state = get();
        if (!state.user) return;

        set({
          user: {
            ...state.user,
            currency,
          },
        });
      },
    }),
    {
      name: 'split-sync-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useStore;
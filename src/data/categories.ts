// Expense categories with icons

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const expenseCategories: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'food-fork-drink',
    color: '#FF6B6B',
  },
  { id: 'transport', name: 'Transportation', icon: 'car', color: '#4ECDC4' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#45B7D1' },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'movie',
    color: '#96CEB4',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'lightning-bolt',
    color: '#FFEAA7',
  },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#DDA0DD' },
  { id: 'health', name: 'Health', icon: 'heart-plus', color: '#FFB6C1' },
  { id: 'education', name: 'Education', icon: 'school', color: '#98D8C8' },
  { id: 'gifts', name: 'Gifts', icon: 'gift', color: '#F7DC6F' },
  { id: 'home', name: 'Home', icon: 'home', color: '#BB8FCE' },
  { id: 'personal', name: 'Personal Care', icon: 'account', color: '#85C1E9' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#A6ACAF' },
];

export const getCategoryById = (id: string): ExpenseCategory | undefined => {
  return expenseCategories.find(category => category.id === id);
};

export const getDefaultCategory = (): ExpenseCategory => {
  return (
    expenseCategories.find(category => category.id === 'other') ||
    expenseCategories[0]
  );
};
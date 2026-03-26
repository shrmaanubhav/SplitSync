import firestore from '@react-native-firebase/firestore';

// USERS
export const createUser = async (userId: string, data: any) => {
  return firestore().collection('users').doc(userId).set(data);
};

// GROUPS
export const createGroup = async (data: any) => {
  return firestore().collection('groups').add(data);
};

// EXPENSES
export const addExpense = async (data: any) => {
  return firestore().collection('expenses').add(data);
};
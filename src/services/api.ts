import axios from 'axios';
import authService from './auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the User interface based on what we know from the store
interface User {
  id: string;
  name: string;
  phoneNumber: string;
  currency: string;
  email?: string;
  bio?: string;
  createdAt?: string;
  _id?: string; // For compatibility with backend responses
}

// Define the AuthResponse interface based on auth.service
interface AuthResponse {
  _id: string;
  name: string;
  phoneNumber: string;
  currency: string;
  email?: string;
  bio?: string;
  createdAt: string;
  token: string;
}

const API_BASE_URL = 'http://192.168.31.6:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data: { name: string; phoneNumber: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { phoneNumber: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<User>('/auth/me'),
};

// User endpoints
export const userApi = {
  getAllUsers: () => api.get<User[]>('/users'),
  searchUsersByPhoneNumber: (phoneNumber: string) =>
    api.get<User[]>(`/users/search?phoneNumber=${phoneNumber}`),
  getUserById: (id: string) => api.get<User>(`/users/${id}`),
  getUserFriends: (id: string) => api.get<User[]>(`/users/${id}/friends`),
  updateUser: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  updateUserProfile: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}/profile`, data), // Add profile update endpoint
  updateUserCurrency: (id: string, currency: string) =>
    api.put<User>(`/users/${id}/currency`, { currency }),
  addFriend: (id: string, friendId: string) =>
    api.post(`/users/${id}/friends`, { friendId }),
  removeFriend: (id: string, friendId: string) =>
    api.delete(`/users/${id}/friends/${friendId}`),
  uploadContacts: (id: string, contacts: any[]) =>
    api.post(`/users/${id}/contacts`, { contacts }),
};

// Group endpoints
export const groupApi = {
  createGroup: (data: any) => api.post('/groups', data),
  getGroups: () => api.get('/groups'),
  getGroupById: (id: string) => api.get(`/groups/${id}`),
  updateGroup: (id: string, data: any) => api.put(`/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/groups/${id}`),
  addMember: (groupId: string, userId: string) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
};

// Expense endpoints
export const expenseApi = {
  createExpense: (data: any) => api.post('/expenses', data),
  getExpenses: () => api.get('/expenses'),
  getExpenseById: (id: string) => api.get(`/expenses/${id}`),
  updateExpense: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),
  getGroupExpenses: (groupId: string) => api.get(`/expenses/group/${groupId}`),
};

// Analytics endpoints
export const analyticsApi = {
  getBalances: () => api.get('/analytics/balances'),
  getGroupBalances: (groupId: string) =>
    api.get(`/analytics/balances/${groupId}`),
  getGlobalAnalytics: () => api.get('/analytics/global'),
};

export default api;
